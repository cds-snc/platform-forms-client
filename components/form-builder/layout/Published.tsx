import React from "react";
import { RocketIcon } from "../icons/RocketIcon";
import { Button } from "../shared/Button";

export const Published = ({ id }: { id: string }) => {
  const linkEn = `https://www.google.com${id}`;
  const linkFr = `https://www.google.com${id}`;
  return (
    <div>
      <div className="p-7 mb-10 flex bg-green-50">
        <div className="flex">
          <div className="flex p-7">
            <RocketIcon className="block self-center" />
          </div>
        </div>
        <div>
          <h2 className="mb-1 pb-0">Your form is published!</h2>
          <p className="mb-5 mt-0">View and share your published form with these links: </p>
          <p>
            <strong>English:</strong> <a href={linkEn}>https://canada.ca</a>
          </p>
          <p>
            <strong>French:</strong> <a href={linkFr}>https://canada.ca</a>
          </p>
        </div>
      </div>
      <div className="mb-5">
        <h3 className="mb-1">Published form errors</h3>
        <p>
          If you are experiencing any problems with your published form, please{" "}
          <a href="http://example.com">contact support.</a>
        </p>
      </div>
      <div className="mb-10">
        <h3 className="mb-1">Provide feedback</h3>
        <p>
          Did you find this tool helpful? <a href="http://example.com">Provide feedback</a>
        </p>
      </div>
      <div>
        <Button>Back to My forms</Button>
      </div>
    </div>
  );
};
