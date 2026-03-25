import { FoodItem, Claim, SOSAppeal } from "./mock-data"

export const CO2_MULTIPLIER = 2.5 // 1kg of food waste = 2.5kg of CO2e
export const TAX_VALUE_PER_KG = 3.5 // $3.50 est tax write-off value per kg

/**
 * Verifies if a user has the appropriate role.
 */
export function verifyUserRole(userRole: "donor" | "ngo", requiredRole: "donor" | "ngo"): boolean {
  return userRole === requiredRole
}

/**
 * Calculates the difference between the expiry date and now.
 * Returns { remainingHours, statusColor: 'red' | 'yellow' | 'green' }
 */
export function calculateTimeRemaining(expiryTimestamp: string | number | Date) {
  const now = new Date().getTime()
  const expiry = new Date(expiryTimestamp).getTime()
  const diffHours = Math.round((expiry - now) / (1000 * 60 * 60))

  let color: "red" | "yellow" | "green" = "green"
  if (diffHours < 2) color = "red"
  else if (diffHours < 12) color = "yellow"

  return {
    remainingHours: diffHours > 0 ? diffHours : 0,
    statusColor: color,
  }
}

/**
 * Automates flagging inventory for donation if within safety threshold (e.g., 24h).
 */
export function autoFlagForDonation(inventoryBatchExpiry: string): boolean {
  const diffHours = calculateTimeRemaining(inventoryBatchExpiry).remainingHours
  // Automatically flag for donation if it expires in less than 24 hours
  return diffHours <= 24 && diffHours > 0
}

/**
 * Handles the logic of an NGO claiming a donation.
 * Removes from available pool and creates a new claim record.
 */
export function claimDonation(donationId: string, ngoId: string, inventory: FoodItem[], setInventory: (i: FoodItem[]) => void, claims: Claim[], setClaims: (c: Claim[]) => void) {
  // Update inventory item status
  const updatedInventory = inventory.map(item => 
    item.id === donationId ? { ...item, status: "Claimed" as const } : item
  )
  setInventory(updatedInventory)

  // Generate new claim
  const newClaim: Claim = {
    id: `c_${Date.now()}`,
    foodItemId: donationId,
    ngoId,
    status: "Pending",
    claimedAt: new Date().toISOString()
  }
  setClaims([newClaim, ...claims])
}

/**
 * Updates a claim's transit status
 */
export function updateDonationStatus(claimId: string, newStatus: "In Transit" | "Received", claims: Claim[], setClaims: (c: Claim[]) => void) {
  const updatedClaims = claims.map(claim => 
    claim.id === claimId ? { ...claim, status: newStatus } : claim
  )
  setClaims(updatedClaims)
}

/**
 * Calculates total CO2 emissions saved based on weight
 */
export function calculateCO2Saved(weightInKg: number): number {
  return weightInKg * CO2_MULTIPLIER
}

/**
 * Generates an estimated tax receipt value
 */
export function generateTaxReceipt(weightInKg: number): number {
  return weightInKg * TAX_VALUE_PER_KG
}

/**
 * Broadcasts an SOS appeal to the ecosystem
 */
export function broadcastSOS(ngoId: string, ngoName: string, requestedItems: string, urgency: "High" | "Medium" | "Low", appeals: SOSAppeal[], setAppeals: (a: SOSAppeal[]) => void) {
  const newAppeal: SOSAppeal = {
    id: `sos_${Date.now()}`,
    ngoId,
    ngoName,
    requestText: requestedItems,
    urgency,
    datePosted: new Date().toISOString()
  }
  setAppeals([newAppeal, ...appeals])
}
