import {writeFileSync} from 'fs';
import path from 'path';
import mergeAllOf from 'json-schema-merge-allof';
import {dereference, JSONSchema,} from 'json-schema-ref-parser';
import minimist from 'minimist';
import {OpenApi} from './Interfaces/OpenApi'

const argv = minimist(process.argv.slice(2));
if (!argv.s || !argv.o) {
    console.log('USAGE: ' + process.argv[1] + ' -s <schema> -o <output> [...]');
    process.exit(1);
}

const input = path.resolve(argv.s);

dereference(input, {}, (err: Error | null, schema: JSONSchema | undefined) => {
    if (err) {
        console.error(err);
    } else {
        let openApiSchema: OpenApi = <OpenApi>schema;//we get an object which has OpenApi keys as properties, so we cast it here
        let output = path.resolve(argv.o);
        let ext = path.parse(output).ext;

        Object.values(openApiSchema.paths).forEach(path => {
            let innerSchema = path.get?.responses['200'].content['application/json']?.schema
            if (!innerSchema) return;

            console.log('BEFORE:' + path)
            console.log(innerSchema)

            let allOfSchema = mergeAllOf(innerSchema, {ignoreAdditionalProperties: true})

            console.log('AFTER:')
            console.log(allOfSchema)
            if (allOfSchema)
                 path.get.responses[200].content['application/json'].schema = allOfSchema
        })

        if (ext === '.json') {
            let data = JSON.stringify(openApiSchema);
            writeFileSync(output, data, {encoding: 'utf8', flag: 'w'});
        } else if (ext.match(/^\.?(yaml|yml)$/)) {
            if (schema) {
                let yaml = require('node-yaml');
                yaml.writeSync(output, openApiSchema, {encoding: 'utf8'})
            }
        } else {
            console.error(`Unrecognised output file type: ${output}`);
            process.exit(1);
        }
        console.log(`Wrote file: ${output}`);
    }
});
