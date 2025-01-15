export const addressTaggedSubmission = {
  form: {
    form: {
      elements: [
        {
          id: 1,
          type: "addressComplete",
        },
      ],
    },
  },
  responses: {
    "1": '{ "answer": "{\\"streetAddress\\":\\"555 A street\\",\\"city\\":\\"Ottawa\\",\\"province\\":\\"Ontario\\",\\"postalCode\\":\\"K2P 1P4\\",\\"country\\":\\"Canada\\"}", "tag": "a-guid-string" }',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const addressTaggedResult = {
  "1": {
    answer:
      '{"streetAddress":"555 A street","city":"Ottawa","province":"Ontario","postalCode":"K2P 1P4","country":"Canada"}',
    tag: "a-guid-string",
  },
};
