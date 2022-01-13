import { DocumentNode, OperationTypeNode } from 'graphql';
import { GraphQLVariables } from '../../handlers/GraphQLHandler';
import { MockedRequest } from '../../handlers/RequestHandler';
export interface ParsedGraphQLQuery {
    operationType: OperationTypeNode;
    operationName?: string;
}
export declare type ParsedGraphQLRequest<VariablesType extends GraphQLVariables = GraphQLVariables> = (ParsedGraphQLQuery & {
    variables?: VariablesType;
}) | undefined;
export declare function parseDocumentNode(node: DocumentNode): ParsedGraphQLQuery;
export declare type GraphQLParsedOperationsMap = Record<string, string[]>;
export declare type GraphQLMultipartRequestBody = {
    operations: string;
    map?: string;
} & {
    [fileName: string]: File;
};
/**
 * Determines if a given request can be considered a GraphQL request.
 * Does not parse the query and does not guarantee its validity.
 */
export declare function parseGraphQLRequest(request: MockedRequest<any>): ParsedGraphQLRequest;
