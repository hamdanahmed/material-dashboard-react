// src/graphql/queries/getRules.js

import { gql } from "@apollo/client";

export const GET_ALL_RULES = gql`
    query GetAllRules {
        rules {
            edges {
                node {
                    id
                    createTime
                    updateTime
                    name
                    description
                    isActive
                    matchType
                    analystID
                }
            }
        }
    }
`;
