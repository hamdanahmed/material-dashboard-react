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
                    Parameters {
                        ... on AmountRuleParameter {
                            amount {
                                Value
                                Operator
                            }
                        }
                        ... on TransactionTypeRuleParameter {
                            transactionType
                        }
                        ... on TransactionStatusRuleParameter {
                            transactionStatus
                        }
                        ... on ReviewStatusRuleParameter {
                            reviewStatus
                        }
                        ... on AdditionalInfoTypeRuleParameter {
                            additionalInfoType
                        }
                        ... on AdditionalInfoStatusRuleParameter {
                            additionalInfoStatus
                        }
                    }
                    analystID
                }
            }
        }
    }
`;
