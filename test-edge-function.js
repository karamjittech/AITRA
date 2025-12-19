#!/usr/bin/env node

/**
 * Test script to verify the analyze-page Edge Function is working
 * Run: node test-edge-function.js
 */

const SUPABASE_URL = 'https://wkihztdrhkgkcteqwvwn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraWh6dGRyaGtna2N0ZXF3dnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzMzNDksImV4cCI6MjA4MDk0OTM0OX0._RRBz7ldnFTu8_e9z7meBDKH_fx6OXRqI5IcBoNkmHU';

console.log('\n🔍 Testing Edge Function: analyze-page\n');
console.log('Target URL: https://example.com');
console.log('Edge Function: ' + SUPABASE_URL + '/functions/v1/analyze-page\n');

async function testEdgeFunction() {
  try {
    console.log('📡 Sending request...');
    const startTime = Date.now();

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/analyze-page`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          url: 'https://example.com',
          userId: '00000000-0000-0000-0000-000000000001'
        })
      }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Response received in ${duration}s`);
    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

    const contentType = response.headers.get('content-type');
    console.log(`Content-Type: ${contentType}\n`);

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (response.ok) {
        console.log('✅ SUCCESS! Edge Function is working!\n');
        console.log('Analysis Results:');
        console.log('  - Overall Score:', data.scores?.overallScore || 'N/A');
        console.log('  - ChatGPT Score:', data.platformScores?.chatgptScore || 'N/A');
        console.log('  - Claude Score:', data.platformScores?.claudeScore || 'N/A');
        console.log('  - Gemini Score:', data.platformScores?.geminiScore || 'N/A');
        console.log('  - Perplexity Score:', data.platformScores?.perplexityScore || 'N/A');
        console.log('  - Page ID:', data.pageId || 'N/A');
        console.log('  - Word Count:', data.analysis?.wordCount || 'N/A');
        console.log('  - H1 Count:', data.analysis?.h1Count || 'N/A');
        console.log('  - H2 Count:', data.analysis?.h2Count || 'N/A');
        console.log('\n🎉 Your scan functionality should work now!\n');
      } else {
        console.log('❌ ERROR: Edge Function returned an error:\n');
        console.log(JSON.stringify(data, null, 2));
        console.log('\n💡 Check:');
        console.log('  1. Is JINA_API_KEY set in Supabase Edge Functions?');
        console.log('  2. Is SUPABASE_SERVICE_ROLE_KEY set?');
        console.log('  3. Check Edge Function logs in Supabase dashboard\n');
      }
    } else {
      const text = await response.text();
      console.log('❌ ERROR: Got HTML instead of JSON!\n');
      console.log('This means the Edge Function is not deployed or crashed.\n');
      console.log('Response preview:');
      console.log(text.substring(0, 500) + '...\n');
      console.log('💡 Troubleshooting:');
      console.log('  1. Check if Edge Function is deployed: ' + SUPABASE_URL + '/functions');
      console.log('  2. Verify environment variables are set');
      console.log('  3. Check Edge Function logs for errors\n');
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:\n');
    console.error(error.message);
    console.log('\n💡 Check:');
    console.log('  1. Your internet connection');
    console.log('  2. Supabase project is active');
    console.log('  3. Edge Function URL is correct\n');
  }
}

testEdgeFunction();
