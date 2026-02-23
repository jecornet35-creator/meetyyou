import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Email regex validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

// Password strength check
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-4
};

Deno.serve(async (req) => {
  try {
    const { firstName, email, password, age, iAmGender, lookingForGender, acceptTerms } = await req.json();

    const errors = {};

    // Prénom
    if (!firstName || firstName.trim().length < 2) {
      errors.firstName = 'Le prénom doit contenir au moins 2 caractères.';
    }

    // Email
    if (!email || !isValidEmail(email)) {
      errors.email = 'Adresse email invalide.';
    }

    // Mot de passe
    if (!password || password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    } else {
      const strength = getPasswordStrength(password);
      if (strength < 2) {
        errors.password = 'Mot de passe trop faible. Ajoutez des majuscules, chiffres ou symboles.';
      }
    }

    // Âge
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 18) {
      errors.age = 'Vous devez avoir au moins 18 ans.';
    }

    // Genre
    if (!iAmGender) {
      errors.iAmGender = 'Veuillez sélectionner votre genre.';
    }
    if (!lookingForGender) {
      errors.lookingForGender = 'Veuillez indiquer ce que vous recherchez.';
    }

    // CGU
    if (!acceptTerms) {
      errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation.';
    }

    const passwordStrength = password ? getPasswordStrength(password) : 0;

    if (Object.keys(errors).length > 0) {
      return Response.json({ valid: false, errors, passwordStrength }, { status: 422 });
    }

    return Response.json({ valid: true, errors: {}, passwordStrength });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});