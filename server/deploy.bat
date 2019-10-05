aws s3 sync backend/public/resource s3://%1/ --acl public-read
aws cloudfront create-invalidation --distribution-id %2 --paths /bundle/*.js