[![SCM Compliance](https://scm-compliance-api.radix.equinor.com/repos/equinor/openapi-flattener/badge)](https://scm-compliance-api.radix.equinor.com/repos/equinor/openapi-flattener/badge)
# openapi-flattener

Install: `npm install openapi-flattener --save -g`

Usage: `openapi-flattener -s oas-with-refs-and-nesting.yaml -o flattened-oas.yaml`

## Description

This package takes an OpenApi (`yaml | json`) file and flattens all references in the file.
This is done largely with the help of existing packages `json-schema-ref-parser` and `json-schema-merge-allof`. The file is de-referenced and the result of that is post-processed, where appropriate elements from an OAS is merged so that inherited fields are lifted to the object level where they are used. 

The purpose of this flattening is to be able to use an OAS document with various tools that doesn't handle references.
