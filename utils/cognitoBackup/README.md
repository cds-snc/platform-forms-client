# Cognito User Pool backup and restore scripts

These scripts can be used to create a copy of user entries in a cogntio user pool. They will download user information into a CSV file and then use the CSV file to import users into a new User Pool.

Things to remember:

- Ensure your AWS credentials are added to `.env`.

## Backup command

`yarn backup {user_pool_id} {csv_file_name}`

- `{user_pool_id}` is the id of the user pool you want to retrieve users from.
- `{csv_file_name}` is the name of the csv file that will be created with the user information.

## Restore command

`yarn restore {user_pool_id}`

- `{user_pool_id}` is the id of the user pool you want to restore users to.
