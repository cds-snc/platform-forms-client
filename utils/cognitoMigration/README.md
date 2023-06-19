# Cognito user attributes migration

These scripts can be used to migrate or convert user attributes in a cognito user pool.

Things to remember:

- Ensure your AWS credentials are added to `.env`.

## Convert email address to lowercase command

`yarn convert-email-address-to-lowercase {user_pool_id}`

- `{user_pool_id}` is the id of the user pool you want to migrate users data from.
