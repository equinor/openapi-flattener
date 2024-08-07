#!/usr/bin/env node

import { writeFileSync } from "fs";
import path from "path";
import { merge } from "allof-merge";
import { dereference, JSONSchema } from "@apidevtools/json-schema-ref-parser";
import minimist from "minimist";
import { OpenApi, RequestBody, Response } from "./Interfaces/OpenApi";

const argv = minimist(process.argv.slice(2));
if (!argv.s || !argv.o) {
  console.log("USAGE: " + process.argv[1] + " -s <schema> -o <output> [...]");
  process.exit(1);
}

const input = path.resolve(argv.s);

function mergeResponse(key: string, response: Response) {
  if (!response?.content || !("application/json" in response.content)) return;

  let responseSchema = response.content["application/json"].schema;
  if (!responseSchema) return;

  let mergedSchema = merge(responseSchema);
  if (mergedSchema) response.content["application/json"].schema = mergedSchema;
}

function mergeRequestBody(requestBody: RequestBody) {
  let bodySchema = requestBody.content["application/json"]?.schema;
  if (!bodySchema) return;

  let mergedSchema = merge(bodySchema);
  if (mergedSchema)
    requestBody.content["application/json"].schema = mergedSchema;
}

dereference(input)
  .then((schema: JSONSchema) => {
    let openApiSchema: OpenApi = <OpenApi>schema; //we get an object which has OpenApi keys as properties, so we cast it here
    let output = path.resolve(argv.o);
    let ext = path.parse(output).ext;

    Object.entries(openApiSchema.paths).forEach(([_, path]) => {
      if (path.get) {
        console.log("GET");
        Object.entries(path.get.responses).forEach(([key, response]) => {
          mergeResponse(key, response);
        });
      }

      if (path.post) {
        console.log("POST");
        Object.entries(path.post.responses).forEach(([key, response]) => {
          mergeResponse(key, response);
        });
        mergeRequestBody(path.post.requestBody);
      }
    });
    if (openApiSchema.components.schemas)
      Object.entries(openApiSchema.components.schemas).forEach(
        ([key, schema]) => {
          openApiSchema.components.schemas[key] = merge(schema);
        }
      );
    if (openApiSchema.components.examples)
      Object.entries(openApiSchema.components.examples).forEach(
        ([key, schema]) => {
          openApiSchema.components.examples[key] = merge(schema);
        }
      );
    if (openApiSchema.components.responses)
      Object.entries(openApiSchema.components.responses).forEach(
        ([key, schema]) => {
          openApiSchema.components.responses[key] = merge(schema);
        }
      );
    if (ext === ".json") {
      let data = JSON.stringify(openApiSchema);
      writeFileSync(output, data, { encoding: "utf8", flag: "w" });
    } else if (ext.match(/^\.?(yaml|yml)$/)) {
      if (schema) {
        let yaml = require("node-yaml");
        yaml.writeSync(output, openApiSchema, { encoding: "utf8" });
      }
    } else {
      console.error(`Unrecognised output file type: ${output}`);
      process.exit(1);
    }
    console.log(`Wrote file: ${output}`);
  })
  .catch((err: Error) => {
    console.log(err);
    process.exit(1);
  });
