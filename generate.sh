#!/bin/bash
set -e

# Create necessary directories
mkdir -p gen/go/identity

# Initialize Go module if not already done
if [ ! -f "go.mod" ]; then
  go mod init github.com/travoroguna/sportsbook-rpc
fi

# Install required tools if not already installed
if ! command -v buf &> /dev/null; then
  echo "Installing buf..."
  go install github.com/bufbuild/buf/cmd/buf@latest
fi

if ! command -v protoc-gen-go &> /dev/null; then
  echo "Installing protoc-gen-go..."
  go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
fi

if ! command -v protoc-gen-go-grpc &> /dev/null; then
  echo "Installing protoc-gen-go-grpc..."
  go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
fi

# Ensure dependencies
go get -u google.golang.org/protobuf/proto
go get -u google.golang.org/grpc
go get -u google.golang.org/protobuf/reflect/protoreflect
go get -u google.golang.org/protobuf/types/known/timestamppb

# Generate code using buf
echo "Generating Go code from proto files..."
buf generate

# Update go.mod with required dependencies
go mod tidy

echo "Code generation complete!"
