"use server"

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Generates a unique trust number for an organization.
 * Format: SUS-{BIZ|NGO}-{YEAR}-{5-DIGIT-RANDOM}
 */
function generateTrustNumber(role: string): string {
  const prefix = role === 'ngo' ? 'NGO' : 'BIZ'
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `SUS-${prefix}-${year}-${random}`
}

export async function registerOrganization(formData: any) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component context — safe to ignore
          }
        },
      },
    }
  )

  // Generate trust number upfront
  const trustNumber = generateTrustNumber(formData.goal)
  const personalPhone = formData.phone ? `${formData.countryCode} ${formData.phone}` : ''
  const orgPhone = formData.orgPhone ? `${formData.orgCountryCode} ${formData.orgPhone}` : ''

  // 1. Sign up the user — store ALL org data in user_metadata
  //    so even if the org insert fails (RLS / no session), 
  //    we can self-heal on first authenticated load.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: personalPhone,
        language: formData.language,
        vehicle: formData.vehicle,
        role: formData.goal,
        organization_name: formData.orgName,
        // Store org details in metadata for self-healing
        org_name: formData.orgName || '',
        org_legal_name: trustNumber,
        org_email: formData.orgEmail || '',
        org_phone: orgPhone,
        org_address: formData.orgAddress || '',
        org_latitude: formData.latitude || '',
        org_longitude: formData.longitude || '',
        org_country: formData.country || 'India',
        org_suite_number: formData.suiteNumber || '',
        org_type: formData.orgType || '',
      }
    }
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: "Failed to create user account." }
  }

  // 2. Try to set session (only works if email confirmation is disabled)
  if (authData.session) {
    await supabase.auth.setSession({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
    })

    // 3. Attempt org insert (may fail if RLS blocks or email confirmation is on)
    const { error: orgError } = await supabase
      .from('organizations')
      .insert({
        user_id: authData.user.id,
        name: formData.orgName || null,
        legal_name: trustNumber,
        email: formData.orgEmail || null,
        phone: orgPhone || null,
        address: formData.orgAddress || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        country: formData.country || null,
        suite_number: formData.suiteNumber || null,
        type: formData.orgType || null,
      })

    if (orgError) {
      console.error("Org insert error (will self-heal on first login):", orgError.message)
    }
  }

  return { success: true }
}
