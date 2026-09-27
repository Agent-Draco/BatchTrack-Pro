const PASSWORD = process.env.SURVEY_RESPONSES_PASSWORD || '';

module.exports = async function surveyResponses(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  let body = request.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (error) { body = {}; }
  }

  const suppliedPassword = String(body.password || '').trim().toLowerCase();
  if (!PASSWORD || suppliedPassword !== PASSWORD.trim().toLowerCase()) {
    response.status(401).json({ error: 'Incorrect password.' });
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    response.status(500).json({ error: 'Response storage is not configured.' });
    return;
  }

  const query = new URL('/rest/v1/survey_responses', process.env.SUPABASE_URL);
  query.searchParams.set('select', 'submitted_at,created_at,response');
  query.searchParams.set('order', 'submitted_at.desc');
  const result = await fetch(query, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  if (!result.ok) {
    response.status(502).json({ error: 'Unable to read responses from Supabase.' });
    return;
  }
  response.status(200).json({ responses: await result.json() });
};