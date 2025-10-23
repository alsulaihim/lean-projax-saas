# Model Context Protocol (MCP) Setup Guide

> Your Complete MCP Configuration Reference

## 📋 Table of Contents

1. [What is MCP?](#what-is-mcp)
2. [Installation Guide](#installation-guide)
3. [MCP Server List](#mcp-server-list)
4. [Configuration Files](#configuration-files)
5. [API Keys Required](#api-keys-required)
6. [Troubleshooting](#troubleshooting)

---

## 🤔 What is MCP?

Model Context Protocol (MCP) extends Claude's capabilities by connecting it to external tools and services. Think of MCPs as plugins that give Claude Code superpowers like:

- Interacting with GitHub repositories
- Managing Docker containers
- Processing payments via Stripe/PayPal
- Accessing your file system
- Storing persistent memory across sessions
- And much more!

---

## 🚀 Installation Guide

### Prerequisites

- Node.js 18+ installed
- npm configured with global directory
- API keys for services you want to use

### Quick Setup

1. **Install MCPs globally** (recommended to avoid NPX cache issues):

```bash
npm install -g \
  @modelcontextprotocol/server-memory \
  @modelcontextprotocol/server-filesystem \
  @modelcontextprotocol/server-github \
  chrome-devtools-mcp \
  docker-mcp \
  supabase-mcp \
  @railway/mcp-server \
  @stripe/mcp \
  @paypal/mcp
```

2. **Configure Cursor/Claude Desktop**:
   - Copy the `mcp.json` template (see below)
   - Add your API keys
   - Restart your IDE

3. **Verify Installation**:
   - Open MCP settings in Cursor
   - Check for green dots next to each MCP
   - Look for available tools/resources

---

## 📦 MCP Server List

### Core Development MCPs

#### 1. **GitHub MCP** 🐙

- **Package:** `@modelcontextprotocol/server-github`
- **Purpose:** Repository, issues, PRs, and GitHub operations
- **Requires:** GitHub Personal Access Token
- **Capabilities:**
  - Search repositories and code
  - Create/update issues and PRs
  - Manage branches and commits
  - Access repository information

#### 2. **Memory MCP** 🧠

- **Package:** `@modelcontextprotocol/server-memory`
- **Purpose:** Persistent knowledge storage across sessions
- **Requires:** No API key
- **Capabilities:**
  - Store information long-term
  - Retrieve context from previous sessions
  - Build knowledge graphs

#### 3. **Filesystem MCP** 📁

- **Package:** `@modelcontextprotocol/server-filesystem`
- **Purpose:** Secure file system access
- **Requires:** No API key (path restriction required)
- **Capabilities:**
  - Read/write files
  - Directory operations
  - File search
- **Security:** Restricts access to specified directories only

#### 4. **Docker MCP** 🐋

- **Package:** `docker-mcp`
- **Purpose:** Container and Docker management
- **Requires:** Docker installed locally OR SSH credentials for remote
- **Capabilities:**
  - Container operations (start, stop, restart, remove)
  - Image management
  - Network and volume management
  - Container logs and monitoring
  - Cleanup operations

#### 5. **Chrome DevTools MCP** 🌐

- **Package:** `chrome-devtools-mcp`
- **Purpose:** Browser automation and testing
- **Requires:** Chrome installed
- **Capabilities:**
  - Navigate pages
  - Take screenshots
  - Execute JavaScript
  - Interact with page elements
  - Network monitoring
  - Performance analysis

### Payment MCPs

#### 6. **Stripe MCP** 💳

- **Package:** `@stripe/mcp`
- **Purpose:** Payment processing and Stripe API integration
- **Requires:** Stripe API Key (test or live)
- **Capabilities:**
  - Customer management
  - Payment processing
  - Subscription handling
  - Invoice management
  - Revenue analytics

#### 7. **PayPal MCP** 💰

- **Package:** `@paypal/mcp`
- **Purpose:** PayPal payment processing
- **Requires:** PayPal Access Token
- **Capabilities:**
  - Payment processing
  - Transaction management
  - Order tracking
  - Invoicing
  - Secure checkout

### Additional MCPs (NPX-based)

#### 8. **Firebase MCP** 🔥

- **Package:** `firebase-tools` (experimental MCP)
- **Purpose:** Firebase services management
- **Requires:** Firebase authentication

#### 9. **Supabase MCP** 🐘

- **Package:** `supabase-mcp`
- **Purpose:** Supabase CRUD operations on database tables
- **Requires:** Supabase project URL, Anon Key, and Service Role Key
- **Capabilities:**
  - Query data with filters
  - Insert, update, delete records
  - List available tables
  - Full PostgreSQL-compatible operations

#### 10. **Railway MCP** 🚂

- **Package:** `@railway/mcp-server`
- **Purpose:** Railway cloud deployment and infrastructure management
- **Requires:** Railway CLI installed and authenticated
- **Capabilities:**
  - Create and deploy projects
  - Deploy from templates (databases, services)
  - Manage environment variables
  - Pull/push environment configs
  - Create preview environments
  - Manage domains
  - Monitor deployments

#### 11. **ShadCN MCP** 🎨

- **Package:** `@jpisnice/shadcn-ui-mcp-server`
- **Purpose:** UI component generation with shadcn/ui

#### 12. **GCP MCP** ☁️

- **Package:** `@google-cloud/gcloud-mcp`
- **Purpose:** Google Cloud Platform integration
- **Requires:** GCP credentials

#### 13. **SonarQube MCP** 🔍

- **Package:** `sonarqube-mcp-server`
- **Purpose:** Code quality analysis
- **Requires:** SonarQube/SonarCloud token

#### 14. **GitKraken MCP** 🦑

- **Purpose:** Advanced Git operations via GitLens
- **Requires:** GitLens extension installed

---

## 📝 Configuration Files

### Location: `~/.cursor/mcp.json` (Cursor) or `~/Library/Application Support/Claude/claude_desktop_config.json` (Claude Desktop)

### Template Structure:

```json
{
  "mcpServers": {
    "github": {
      "command": "/Users/YOUR_USERNAME/.npm-global/bin/mcp-server-github",
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN"
      }
    },
    "memory": {
      "command": "/Users/YOUR_USERNAME/.npm-global/bin/mcp-server-memory"
    },
    "filesystem": {
      "command": "/Users/YOUR_USERNAME/.npm-global/bin/mcp-server-filesystem",
      "args": ["/Users/YOUR_USERNAME"]
    },
    "docker": {
      "command": "/Users/YOUR_USERNAME/.npm-global/bin/docker-mcp",
      "env": {
        "DOCKER_MCP_LOCAL": "true"
      }
    },
    "chrome-devtools": {
      "command": "/Users/YOUR_USERNAME/.npm-global/bin/chrome-devtools-mcp"
    },
    "stripe": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/.npm-global/lib/node_modules/@stripe/mcp/dist/index.js",
        "--tools=all",
        "--api-key=YOUR_STRIPE_API_KEY"
      ]
    },
    "paypal": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/.npm-global/lib/node_modules/@paypal/mcp/dist/index.js",
        "--tools=all"
      ],
      "env": {
        "PAYPAL_ACCESS_TOKEN": "YOUR_PAYPAL_TOKEN",
        "PAYPAL_ENVIRONMENT": "SANDBOX"
      }
    }
  }
}
```

---

## 🔑 API Keys Required

### GitHub Personal Access Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
   - `read:user` (Read user profile data)
   - `user:email` (Access user email addresses)
4. Copy token and add to config

### Stripe API Key

1. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
2. Copy **Secret Key**:
   - `sk_test_...` for test mode
   - `sk_live_...` for production
3. Add to config

### PayPal Access Token

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create or select an app
3. Generate access token
4. Set environment to:
   - `SANDBOX` for testing
   - `LIVE` for production

### Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create new one)
3. Go to Settings → API
4. Copy these keys:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon (public) key**: For client-side operations
   - **Service role key**: For server-side operations (keep secret!)
5. Add all three to your MCP config

### Railway CLI Setup

1. **Install Railway CLI:**

   ```bash
   # macOS/Linux
   brew install railway

   # Or via npm
   npm install -g @railway/cli

   # Or via shell script
   curl -fsSL https://railway.app/install.sh | sh
   ```

2. **Authenticate:**

   ```bash
   railway login
   ```

   This will open your browser to authenticate

3. **Verify Installation:**
   ```bash
   railway whoami
   ```

**Note:** Railway MCP requires Railway CLI to be installed and authenticated. No additional config needed in mcp.json.

### SonarQube Token (Optional)

1. Go to [SonarCloud](https://sonarcloud.io)
2. My Account → Security → Generate Token
3. Add to config

---

## 🔧 Troubleshooting

### Common Issues

#### ❌ Red Dots / "No tools, prompts or resources"

**Cause:** MCP server failed to start

**Solutions:**

1. Clear NPX cache:

   ```bash
   rm -rf ~/.npm/_npx ~/.npm/_cacache
   npm cache clean --force
   ```

2. Use global installations instead of NPX (recommended)

3. Check logs in IDE Developer Tools (Help → Toggle Developer Tools → Console)

#### ❌ Module Resolution Errors (zod, etc.)

**Cause:** NPX cache corruption with Node.js v22

**Solution:** Use global installations as shown in this guide

#### ❌ GitHub MCP Shows Red Dot

**Causes:**

- Invalid or expired token
- Wrong package name (`@octokit/mcp-server` doesn't exist)
- Missing token in env

**Solution:**

- Use correct package: `@modelcontextprotocol/server-github`
- Verify token is valid
- Ensure token is in `env.GITHUB_PERSONAL_ACCESS_TOKEN`

#### ❌ Stripe/PayPal MCP Not Working

**Causes:**

- Missing `--tools=all` parameter (Stripe)
- Using command-line args instead of env vars (PayPal)
- Invalid API keys

**Solution:**

- Follow exact configuration format above
- Verify API keys are valid
- Check sandbox vs production environment

### Performance Tips

1. **Use Global Installations**: Faster startup, no cache issues
2. **Disable Unused MCPs**: Comment out MCPs you don't need
3. **Limit Filesystem Scope**: Only give access to needed directories
4. **Use Test Keys**: Use test/sandbox keys during development

### Updating MCPs

```bash
# Update all global MCPs
npm update -g \
  @modelcontextprotocol/server-memory \
  @modelcontextprotocol/server-filesystem \
  @modelcontextprotocol/server-github \
  chrome-devtools-mcp \
  docker-mcp \
  @stripe/mcp \
  @paypal/mcp

# After updating, restart your IDE
```

---

## 🎯 Quick Reference

### Essential MCPs for Most Projects

- ✅ **GitHub** - Version control
- ✅ **Memory** - Context persistence
- ✅ **Filesystem** - File operations
- ✅ **Docker** - Container management (if using Docker)

### Add as Needed

- 💳 **Stripe/PayPal** - Payment features
- 🌐 **Chrome DevTools** - Browser testing/automation
- 🐘 **Supabase** - Database operations
- ☁️ **GCP/Firebase** - Cloud services

---

## 📚 Additional Resources

- [MCP Official Documentation](https://modelcontextprotocol.io)
- [Anthropic MCP Docs](https://docs.anthropic.com/mcp)
- [MCP Server Registry](https://github.com/modelcontextprotocol/servers)

---

## 🔄 Maintenance

**Monthly:**

- Update MCP packages
- Review and rotate API keys
- Remove unused MCPs

**Per Project:**

- Copy this config as template
- Adjust filesystem paths
- Enable only needed MCPs
- Document project-specific MCPs in SESSION-CONTEXT.md

---

**Last Updated:** [DATE]
**Configuration Version:** 1.0

[END OF MCP-SETUP.md]
