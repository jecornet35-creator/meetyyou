import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { firstName, email, password, age, iAmGender, lookingForGender, acceptTerms } = body;

    const errors = {};

    if (!firstName || firstName.trim().length < 2) {
      errors.firstName = 'Le prénom est requis (minimum 2 caractères)';
    }
    if (!email || !isValidEmail(email)) {
      errors.email = 'Adresse email invalide';
    }
    if (!password || password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!age) {
      errors.age = 'L\'âge est requis';
    }
    if (!iAmGender) {
      errors.iAmGender = 'Veuillez sélectionner votre genre';
    }
    if (!lookingForGender) {
      errors.lookingForGender = 'Veuillez sélectionner ce que vous recherchez';
    }
    if (!acceptTerms) {
      errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }

    const passwordStrength = getPasswordStrength(password || '');

    if (Object.keys(errors).length > 0) {
      return Response.json({ valid: false, errors, passwordStrength }, { status: 422 });
    }

    // All valid - save profile and correspondance data using service role
    const base44 = createClientFromRequest(req);

    // Map looking_for value
    let lookingForValue = 'both';
    if (lookingForGender === 'homme') lookingForValue = 'men';
    else if (lookingForGender === 'femme') lookingForValue = 'women';

    // Map gender value
    let genderValue = 'autre';
    if (iAmGender === 'homme') genderValue = 'homme';
    else if (iAmGender === 'femme') genderValue = 'femme';

    // Store pending signup data keyed by email so the Home page can pick it up after redirect
    // We use a special entity-less approach: return the data in the response for the frontend to store
    return Response.json({
      valid: true,
      passwordStrength,
      pendingData: {
        profile: {
          first_name: firstName.trim(),
          display_name: firstName.trim(),
          age: parseInt(age),
          gender: genderValue,
        },
        correspondance: {
          looking_for: lookingForValue,
        }
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});