// src/graphql/queries/getTransactionsCount.js
import { gql } from "@apollo/client";

export const GET_ALL_CLIENT_TRANSACTIONS = gql`
    query GetAllClientTransactions {
        clientTransactions {
            edges {
                node {
                    id
                    createTime
                    updateTime
                    amount
                    transactionType
                    status
                    reviewStatus
                    additionalInfoType
                    additionalInfoStatus
                    flaggedReason
                }
            }
        }
    }
`;
