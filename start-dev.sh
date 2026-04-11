#!/bin/zsh
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"
cd "/Users/mittxl/Documents/AI Websites/Nate opus v3/goodgtm"
exec node node_modules/.bin/next dev --port 3001
