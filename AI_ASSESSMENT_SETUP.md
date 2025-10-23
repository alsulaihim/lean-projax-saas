# AI-Powered Assessment Setup Guide

This guide will help you configure the AI-Powered Assessment feature in Lean Projax.

## Overview

The AI-Powered Assessment feature uses OpenAI's GPT-4o model to provide comprehensive analysis of completed Six Sigma assignments. It analyzes:

- VOC (Voice of Customer) statements and CTQ requirements
- Process efficiency and cycle time
- FMEA (Failure Mode and Effects Analysis) entries
- Value Stream Mapping data
- Recommendations and improvement opportunities

## Features

✅ **Comprehensive Analysis**

- Overview of assignment completion
- 5-7 key insights about the assignment
- 6-8 deep insights categorized by type (VOC, Process, Quality, Recommendations)

✅ **Metrics & Scoring**

- Process Efficiency Score (0-100%)
- Quality Score (0-100%)
- Risk Level Assessment (Low/Medium/High)

✅ **Smart Requirements**

- Only available for completed assignments
- Analyzes all assignment data comprehensively
- Provides actionable insights

## Setup Instructions

### 1. Get OpenAI API Key

#### Step 1: Create OpenAI Account

1. Go to [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Sign up for an OpenAI account
3. Complete account verification

#### Step 2: Add Billing Information

1. Navigate to [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
2. Add a payment method
3. OpenAI charges per token used (very affordable for typical usage)

**Pricing (as of 2024):**

- GPT-4o: ~$0.005 per 1K input tokens, ~$0.015 per 1K output tokens
- Typical assessment costs ~$0.01-0.05 per analysis

#### Step 3: Get API Key

1. Navigate to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Give it a name like "Lean Projax AI Assessment"
4. Copy the API key (starts with `sk-...`)
5. **Important**: Save it immediately - you won't be able to see it again!

#### Step 4: Update Environment Variable

Add to your `.env.local`:

```env
OPENAI_API_KEY="sk-your-actual-api-key-here"
```

**⚠️ Security Note**: Never commit your OpenAI API key to version control!

### 2. Restart Development Server

After adding the API key, restart your dev server to load the new environment variable:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

### 3. Test the AI Assessment

1. **Navigate to a completed assignment**
   - Go to [http://localhost:3070/assignments](http://localhost:3070/assignments)
   - Click on any assignment with status "COMPLETED"

2. **Click the AI Assessment Tab**
   - The "AI Assessment" tab should be visible
   - Click it to view/generate the assessment

3. **Generate Assessment**
   - Click "Generate AI Assessment" button
   - Wait 5-15 seconds for analysis
   - Review the comprehensive assessment

## API Endpoints

### POST `/api/ai/assessment/[id]`

Generates AI assessment for a completed assignment.

**Requirements:**

- User must be authenticated
- Assignment must exist and belong to user
- Assignment status must be "COMPLETED"
- OPENAI_API_KEY must be configured

**Request:**

```typescript
POST /api/ai/assessment/77cae351-cfc4-44e2-b938-9783e9129030
// No body required
```

**Response:**

```json
{
  "overview": "This assignment demonstrates comprehensive process improvement...",
  "keyInsights": [
    "Strong VOC capture with 5 statements translated to 8 CTQ requirements",
    "Process efficiency of 65% indicates room for waste reduction",
    "3 high-risk FMEA entries require immediate attention"
  ],
  "deepInsights": [
    {
      "title": "Customer Voice Translation",
      "description": "The VOC to CTQ conversion shows good alignment...",
      "category": "voc"
    },
    {
      "title": "Cycle Time Optimization",
      "description": "Value-added time is only 35% of total cycle time...",
      "category": "process"
    }
  ],
  "metrics": {
    "processEfficiency": 65,
    "qualityScore": 78,
    "riskLevel": "Medium"
  }
}
```

## How It Works

### 1. Data Collection

The API gathers comprehensive data about the assignment:

- All VOC statements and CTQ requirements
- Process information (SIPOC, VSM, FMEA)
- Value-added vs non-value-added time
- Process capability metrics
- Recommendations and their priority

### 2. AI Analysis

The data is sent to OpenAI GPT-4o with a detailed prompt asking for:

- Overall assessment
- Key insights (high-level findings)
- Deep insights (detailed analysis with categories)
- Quantitative metrics

### 3. Structured Response

The AI returns a structured JSON response that's displayed in a beautiful UI with:

- Color-coded insight categories
- Progress bars for metrics
- Risk level indicators
- Actionable recommendations

## UI Components

The AI Assessment is displayed using several components:

### [components/sections/ai-assessment.tsx](components/sections/ai-assessment.tsx)

Main component that:

- Fetches assignment data
- Generates AI assessment
- Displays results with beautiful UI
- Handles loading and error states

### Features:

- **Loading State**: Shows spinner while generating
- **Error Handling**: Clear error messages
- **Category Icons**: Different icons for each insight type
  - 🎯 VOC insights
  - ⚙️ Process insights
  - 📊 Quality insights
  - 💡 Recommendation insights
- **Metrics Display**: Visual progress bars and badges

## Cost Management

### Typical Usage Costs

- **Single Assessment**: ~$0.01-0.05
- **100 Assessments/month**: ~$1-5
- **1,000 Assessments/month**: ~$10-50

### Cost Optimization Tips

1. **Cache Results**: Assessments are generated once per request (no automatic caching yet)
2. **Use Wisely**: Only generate for completed, finalized assignments
3. **Monitor Usage**: Check OpenAI dashboard regularly
4. **Set Limits**: Configure usage limits in OpenAI dashboard

### Setting Usage Limits

1. Go to [https://platform.openai.com/account/limits](https://platform.openai.com/account/limits)
2. Set a monthly budget limit (e.g., $10/month)
3. OpenAI will email you at 75% and 100% usage

## Troubleshooting

### "OpenAI API key not configured"

**Solution**:

- Verify OPENAI_API_KEY is in `.env.local`
- Restart dev server after adding key
- Ensure no extra spaces in the key

### "AI Analysis is only available for completed assignments"

**Solution**:

- Change assignment status to "COMPLETED"
- Complete all required sections
- Save the assignment

### "Failed to generate assessment"

**Possible causes:**

1. **Invalid API Key**: Check key is correct and active
2. **No Credit**: Add billing information to OpenAI account
3. **Rate Limit**: Wait a moment and try again
4. **Network Error**: Check internet connection

### "Insufficient Quota"

**Solution**:

- Add billing information to OpenAI account
- Check usage limits in OpenAI dashboard
- Ensure payment method is valid

## Advanced Configuration

### Changing AI Model

Edit `app/api/ai/assessment/[id]/route.ts`:

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini', // Cheaper alternative
  // or 'gpt-4-turbo' for more advanced analysis
  messages: [...]
})
```

**Model Options:**

- `gpt-4o`: Best quality, balanced cost (~$0.02/assessment)
- `gpt-4o-mini`: Lower cost (~$0.005/assessment)
- `gpt-4-turbo`: Advanced analysis (~$0.03/assessment)

### Customizing Analysis Prompt

Modify the prompt in `app/api/ai/assessment/[id]/route.ts` to:

- Request different types of insights
- Change number of insights generated
- Add industry-specific analysis
- Include additional metrics

### Adding Caching

To reduce costs, add caching:

```typescript
// Add to your API route
const cacheKey = `assessment:${id}:${assignment.updatedAt}`
const cached = await redis.get(cacheKey)
if (cached) return NextResponse.json(JSON.parse(cached))

// After generating assessment
await redis.set(cacheKey, JSON.stringify(assessment), { ex: 3600 }) // 1 hour
```

## Production Considerations

### 1. API Key Security

- Use environment variables (never hardcode)
- Don't commit `.env.local` to version control
- Use different keys for dev/staging/production

### 2. Rate Limiting

Consider adding rate limiting to prevent abuse:

```typescript
// Limit to 10 assessments per user per day
const userAssessmentCount = await redis.incr(`user:${user.id}:assessments:${today}`)
if (userAssessmentCount > 10) {
  return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 })
}
```

### 3. Monitoring

- Monitor OpenAI usage in their dashboard
- Track assessment generation in your analytics
- Set up alerts for unusual usage patterns

### 4. Error Logging

- Log all OpenAI API errors for debugging
- Track failed assessments
- Monitor response times

## Additional Resources

- **OpenAI Platform**: [https://platform.openai.com](https://platform.openai.com)
- **OpenAI Pricing**: [https://openai.com/pricing](https://openai.com/pricing)
- **API Documentation**: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **Usage Dashboard**: [https://platform.openai.com/usage](https://platform.openai.com/usage)

## Support

For issues with:

- **OpenAI API**: Check [OpenAI Support](https://help.openai.com)
- **Application**: Review server logs and error messages
- **Billing**: Contact OpenAI billing support

---

**Ready to use AI Assessment?**

1. Get your OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Add it to `.env.local`
3. Restart your dev server
4. Generate your first AI assessment!
