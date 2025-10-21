#!/bin/bash
# MCP Setup Script
# Installs all recommended MCP servers globally

echo "🚀 Installing MCP Servers..."
echo ""

# Core MCPs
echo "📦 Installing Core MCPs..."
npm install -g \
  @modelcontextprotocol/server-memory \
  @modelcontextprotocol/server-filesystem \
  @modelcontextprotocol/server-github \
  chrome-devtools-mcp \
  docker-mcp

echo ""
echo "🗄️ Installing Database MCPs..."
npm install -g \
  supabase-mcp

echo ""
echo "☁️ Installing Cloud MCPs..."
npm install -g \
  @railway/mcp-server

echo ""
echo "💳 Installing Payment MCPs..."
npm install -g \
  @stripe/mcp \
  @paypal/mcp

echo ""
echo "✅ MCP Installation Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Install Railway CLI (if using Railway):"
echo "   brew install railway  OR  npm install -g @railway/cli"
echo "   Then: railway login"
echo ""
echo "2. Copy .ai/mcp.json.template to ~/.cursor/mcp.json (or Claude Desktop config)"
echo "3. Replace YOUR_USERNAME with your actual username"
echo "4. Add your API keys (see MCP-SETUP.md for instructions)"
echo "5. Restart your IDE"
echo ""
echo "📚 For detailed setup instructions, see: .ai/MCP-SETUP.md"
