"use server"

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function registerOrganization(formData: any) {
  const cookieStore = await cookies()

  // Create a fresh Supabase server client
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

  // 1. Sign up the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        language: formData.language,
        vehicle: formData.vehicle,
        role: formData.goal,
        organization_name: formData.orgName,
      }
    }
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: "Failed to create user account." }
  }

  // 2. If we got a session back, set it so RLS recognizes the user
  if (authData.session) {
    await supabase.auth.setSession({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
    })
  }

  // 3. Insert organization details
  const orgPayload = {
    user_id: authData.user.id,
    name: formData.orgName || null,
    legal_name: formData.orgLegalName || null,
    email: formData.orgEmail || null,
    phone: formData.orgPhone || null,
    address: formData.orgAddress || null,
    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    country: formData.country || null,
    suite_number: formData.suiteNumber || null,
    type: formData.orgType || null,
  }

  const { error: orgError } = await supabase
    .from('organizations')
    .insert(orgPayload)

  if (orgError) {
    console.error("Organization insert error:", orgError.message, orgError.code, orgError.details)
    // Return success anyway — the auth account was created.
    // The user can update their org info later from the profile page.
    return { success: true, warning: "Account created but organization details could not be saved. You can update them on your profile page." }
  }

  return { success: true }
}
