# strapi-provider-upload-aws-s3-sharp-resize

## Configurations

Your configuration is passed down to the provider. (e.g: `new AWS.S3(config)`)

**Example**

`./extensions/upload/config/settings.json`

```json
{
  "provider": "aws-s3-sharp-resize",
  "providerOptions": {
    "accessKeyId": "${process.env.ACCESS_KEY_ID}",
    "secretAccessKey": "${process.env.SECRET_ACCESS_KEY}",
    "endpoint": "nyc3.digitaloceanspaces.com",
    "optimize": {
      "resize": true,
      "width": 1000,
      "height": 1000
    },
    "settings": {
      "awsUploadFolder": "your upload folder"
    },
    "params": {
      "Bucket": "strapi-app"
    }
  }
}
```

## Run this in your controller to delete resources from s3 when related records are removed

`/api/articles/controllers/articles.js`

```js
'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  async delete(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.restaurants.delete({ id });

    if (entity) {
      if (entity.featurette.length > 0) {
        entity.featurette.forEach(image => {
          strapi.plugins.upload.services.upload.remove(image);
          strapi.plugins.upload.provider.delete(image);
        });
      }
    }

    return sanitizeEntity(entity, { model: strapi.models.restaurants });
  }
};
```

"# strapi-provider-upload-aws-s3-sharp-resize" 