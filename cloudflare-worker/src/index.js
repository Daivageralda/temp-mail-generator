import { corsHeaders } from './utils.js';
import { handleEmail } from './handlers/email.js';
import { handleApi } from './handlers/api.js';

export default {
  async email(message, env, ctx) {
    await handleEmail(message, env);
  },

  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    return handleApi(request, env);
  },
};
