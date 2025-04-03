#!/bin/bash
set -e

# Create necessary directories
mkdir -p gen/go/identity
mkdir -p gen/ts/identity
mkdir -p gen/js/identity

# Initialize Go module if not already done
if [ ! -f "go.mod" ]; then
  go mod init github.com/travoroguna/sportsbook-rpc
fi

# Install required tools if not already installed
if ! command -v buf &> /dev/null; then
  echo "Installing buf..."
  go install github.com/bufbuild/buf/cmd/buf@latest
fi

# Go protobuf tools
if ! command -v protoc-gen-go &> /dev/null; then
  echo "Installing protoc-gen-go..."
  go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
fi

if ! command -v protoc-gen-go-grpc &> /dev/null; then
  echo "Installing protoc-gen-go-grpc..."
  go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
fi

# TypeScript/JavaScript tools (requires npm)
if command -v npm &> /dev/null; then
  echo "Installing TypeScript/JavaScript protobuf tools locally..."
  # Install the plugins locally instead of globally
  npm install --save-dev @bufbuild/protoc-gen-es @bufbuild/protoc-gen-connect-es
  npm install --save-dev @bufbuild/protobuf @bufbuild/connect
  
  # Make sure the executables from node_modules/.bin are in PATH
  export PATH="$PATH:$(pwd)/node_modules/.bin"
  
  # Create a minimal package.json if it doesn't exist
  if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    cat > package.json << 'EOL'
{
  "name": "sportsbook-rpc",
  "version": "1.0.0",
  "description": "gRPC definitions for Sportsbook",
  "main": "gen/js/index.js",
  "types": "gen/ts/index.d.ts",
  "files": [
    "gen/js",
    "gen/ts"
  ],
  "scripts": {
    "build": "./generate.sh"
  },
  "dependencies": {
    "@bufbuild/connect": "^0.8.0",
    "@bufbuild/connect-web": "^0.8.0",
    "@bufbuild/protobuf": "^1.0.0"
  },
  "devDependencies": {
    "@bufbuild/protoc-gen-es": "^1.0.0",
    "@bufbuild/protoc-gen-connect-es": "^0.8.0",
    "typescript": "^4.9.0"
  }
}
EOL
  fi
fi

# Ensure Go dependencies
echo "Installing Go dependencies..."
go get -u google.golang.org/protobuf/proto
go get -u google.golang.org/grpc
go get -u google.golang.org/protobuf/reflect/protoreflect
go get -u google.golang.org/protobuf/types/known/timestamppb

# Update buf.gen.yaml to remove JS/gRPC-JS plugins temporarily
# We'll only use ES and Connect-ES which are more modern
cat > buf.gen.yaml << 'EOL'
version: v1
plugins:
  # Go plugins
  - name: go
    out: gen/go
    opt: paths=source_relative
  - name: go-grpc
    out: gen/go
    opt: paths=source_relative,require_unimplemented_servers=false
  
  # TypeScript plugins
  - name: es
    out: gen/ts
    opt: target=ts
  - name: connect-es
    out: gen/ts
    opt: target=ts
EOL

# Generate code using buf
echo "Generating code from proto files..."
buf generate

# Update go.mod with required dependencies
go mod tidy

# Create TypeScript index files for easier imports
echo "Creating TypeScript index files..."
mkdir -p gen/ts
if [ -d "gen/ts/identity" ]; then
  cat > gen/ts/index.ts << 'EOL'
export * from './identity/identity_pb';
export * from './identity/identity_connect';
EOL
fi

echo "Code generation complete!"