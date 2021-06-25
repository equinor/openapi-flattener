export interface OpenApi {
    openapi: string,
    info: Info
    externalDocs: ExternalDocs
    servers: ExternalDocs[]
    security: Security[]
    tags: Tag[]
    'x-tagGroups': any[]
    paths: { [id: string]: Path }
    components: Components
}
interface Path{
 'get': Get
 'post': Post
 'patch': any
 'put': any
 'delete': any
}
interface Parameter {
    in: string
    name: string
    description: string
    required: boolean
    schema: Schema
}
interface Schema {
    type: string
    enum?: string[]
}

interface Tag {
    name: string
    description: string
}
interface Security {
    bearerAuth?: any[]
    apiKey?: any[]
}
interface ExternalDocs {
    description: string
    url: string
}
interface Info {
    title: string
    description: string
    version: string
    contact: Contact
    license: Contact
    'x-logo': any
}

export interface Response {
    content : {[key in ContentType]  : Content}
}

export interface RequestBody {
    content : {[key in ContentType] : Content}
}

export interface Content{
    schema: any
}
export const ResponseArray = ['200','201','204','400','401','403','404','409','500','501','502','503'];

 export type ResponseCode = typeof ResponseArray[number]

export type ContentType = 'application/json'|'application/octet'

export interface Components{
     schemas : {[key : string] : any}
     examples : {[key : string] : any}
     responses : {[key : string] : any}
}

interface Contact {
    name: string
    url: string
}
interface Get {
    tags: string[]
    summary: string
    description: string
    operationId: string
    parameters: Parameter[]
    responses: { [responses in ResponseCode]: Response }
}

interface Post {
    tags: string[]
    summary: string
    description: string
    operationId: string
    parameters: any[]
    requestBody: RequestBody
    responses: { [responses in ResponseCode]: Response }
}
interface Patch {
    tags: string[]
    summary: string
    description: string
    operationId: string
    parameters: any[]
    requestBody: any
    responses: any
}
