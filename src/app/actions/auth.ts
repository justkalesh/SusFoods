"use server"

import { createClient } from "@/utils/supabase/server"

export async function registerOrganization(formData: any) {
  const supabase = await createClient()

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
        role: formData.goal, // 'donor' or 'ngo'
      }
    }
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: "Failed to create user account." }
  }

  // 2. Insert into profiles FIRST (it's the foreign key target for food_items, claims, etc.)
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      role: formData.goal === "ngo" ? "ngo" : "business",
      name: `${formData.firstName} ${formData.lastName}`,
      organization_name: formData.orgName
    })

  if (profileError) {
    console.error("Profile insert error:", profileError)
    return { success: false, error: profileError.message || "Account created, but failed to save profile." }
  }

  // 3. Insert organization details into the 'organizations' table
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
    // Non-fatal: profile was created, org details are supplementary
  }

  return { success: true }
}
