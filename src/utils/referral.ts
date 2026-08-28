/**
 * Utility to generate globally accessible public referral links that work on any device.
 */
export function getPublicReferralLink(refCode: string): string {
  const code = refCode || 'VIP-89421-REF';
  const publicSharedUrl = 'https://ais-pre-mude54z4rgxxojhge2xvtq-721650983710.europe-west2.run.app';
  
  if (typeof window === 'undefined') {
    return `${publicSharedUrl}?ref=${code}`;
  }

  const origin = window.location.origin || '';

  // If origin is private AI Studio container (aistudio.google.com / google.com / ais-dev-*) or local dev,
  // ALWAYS use the public shared domain (ais-pre-*) so external users on other devices do NOT get Google 403 Forbidden!
  const isPrivateStudioDomain = 
    origin.includes('aistudio.google.com') || 
    origin.includes('google.com') ||
    origin.includes('ais-dev-') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.includes('::1') ||
    !origin;

  if (isPrivateStudioDomain) {
    return `${publicSharedUrl}?ref=${code}`;
  }

  // If already running on public ais-pre-* or custom domain, use current origin
  return `${origin}?ref=${code}`;
}

/**
 * Extracts referral code from current URL parameters or hash
 */
export function getInitialReferralCode(): string {
  if (typeof window === 'undefined') return '';

  try {
    const searchParams = new URLSearchParams(window.location.search);
    let code = searchParams.get('ref') || searchParams.get('invite') || searchParams.get('code');

    if (!code && window.location.hash) {
      const hashQuery = window.location.hash.split('?')[1];
      if (hashQuery) {
        const hashParams = new URLSearchParams(hashQuery);
        code = hashParams.get('ref') || hashParams.get('invite') || hashParams.get('code');
      }
    }

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      localStorage.setItem('apex_ref_code', cleanCode);
      return cleanCode;
    }
  } catch (err) {
    console.error('Error parsing referral code:', err);
  }

  return localStorage.getItem('apex_ref_code') || '';
}

/**
 * Gets or creates a unique persistent referral code for the current user or device.
 */
export function getOrCreateUserReferralCode(user?: { referralCode?: string } | null): string {
  if (user?.referralCode) {
    return user.referralCode;
  }

  if (typeof window === 'undefined') {
    return 'VIP-89421-REF';
  }

  const stored = localStorage.getItem('apex_user_personal_ref_code');
  if (stored) {
    return stored;
  }

  // Generate a unique, professional referral code
  const rand = Math.floor(100000 + Math.random() * 900000);
  const newCode = `VIP-${rand}-REF`;
  localStorage.setItem('apex_user_personal_ref_code', newCode);
  return newCode;
}

/**
 * Customizes or updates the current user's referral code
 */
export function setUserCustomReferralCode(newCode: string): string {
  const clean = newCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (clean && typeof window !== 'undefined') {
    localStorage.setItem('apex_user_personal_ref_code', clean);
  }
  return clean;
}

