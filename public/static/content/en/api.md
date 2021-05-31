# Developer API Guide

## Template API

The template API provides the ability to access Create, Read, Update, and Delete (CRUD) operations on JSON template objects. All API requests are type POST.

### Authentication

Only the `GET` method can be used without authentication. The `INSERT`, `UPDATE`, and `DELETE` methods all require a valid `next-auth.session-token` attached in the Cookie value of the request Header.

### Request Body

```json
{
  method: "GET" || "INSERT" || "UPDATE" || "DELETE",
  formID: "formID string identifier",
  formConfig: {JSON Configuration Object}
}
```

### Response Body (GET method)

```json
{
  data:{
    records: [
      {
        'JSON Form Schema'
      }
    ]
  }
}
```

### Response Body (INSERT method)

```json
{
  "data": {
    "records": [
      {
        "formID": "created formID"
      }
    ]
  }
}
```

### Response Body(UPDATE, DELETE method)

```json
{
  "data": {
    "numberOfRecordsUpdated": 1
  }
}
```

---

## Submission API

The Submission API provides the ability to submit form responses for a given form ID. This API does not require authentication. API requests are type POST and must be set to `Content-Type: "mulitpart/form-data"`

### Request Body

The request body is made up of only the generated FormData object. Each form field value is appended to the FormData object using it's form field ID.

---

## Retrieval API

The Retrieval API allows for the retrieval and deletion of submission responses from the vault storage. All API requests are type POST.

### Authentication

All API requests require a valid `next-auth.session-token` attached in the Cookie value of the request Header.

### Request Body (GET action)

```json
{
  "formID": "Form ID to search for responses",
  "action": "GET"
}
```

### Response Body (GET action)

```json
{
  "Items": [
    {
      "FormSubmission": {
        "S": "String representation of the Form Submission Object"
      },
      "SubmissionID": {
        "S": "Submission Response Unique Identifier"
      },
      "FormID": {
        "S": "Form ID"
      }
    }
  ]
}
```

### Request Body (DELETE action)

```json
{
  "responseID": "Submission Response Unique Identifier",
  "action": "DELETE"
}
```

Response returns HTTP status code 200 if sucessful.
