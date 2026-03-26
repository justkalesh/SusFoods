"use server"

import { createClient } from "@/utils/supabase/server"

export async function registerOrganization(formData: any) {
  const supabase = await createClient()

  // 1. Sign up the user in Supabase Auth
  // The DB trigger `on_auth_user_created` will auto-create the profiles row
  // using raw_user_meta_data fields.
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
        role: formData.goal, // 'donor' or 'ngo' — the trigger maps 'ngo' → 'ngo', else → 'business'
      }
    }
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: "Failed to create user account." }
  }

  // 2. Insert organization details into the 'organizations' table
  // Profile row is already created by the auth trigger at this point.
  const { error: orgError } = await supabase
    .from('organizations')
    .insert({
      user_id: authData.user.id,
      name: formData.orgName,
      legal_name: formData.orgLegalName,
      email: formData.orgEmail,
      phone: formData.orgPhone,
      address: formData.orgAddress,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      country: formData.country,
      suite_number: formData.suiteNumber,
      type: formData.orgType,
    })

  if (orgError) {
    console.error("Organization insert error:", orgError)
    // Non-fatal: profile was created by trigger, org details are supplementary
  }

  return { success: true }
}
