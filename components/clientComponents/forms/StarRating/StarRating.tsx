"use client";
import React, { useState } from "react";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";

interface StarRatingProps extends InputFieldProps {
  numberOfStars?: number;
}

export const StarRating = (props: StarRatingProps): React.ReactElement => {
  const { name, required, numberOfStars = 5, id } = props;
  const [field, meta, helpers] = useField(name);
  const [hovered, setHovered] = useState<number | null>(null);

  const currentValue = field.value ? Number(field.value) : 0;
  const activeValue = hovered !== null ? hovered : currentValue;

  const stars = Array.from({ length: numberOfStars }, (_, i) => i + 1);

  return (
    <div className="gc-star-rating">
      {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}
      <div className="gc-star-rating__stars flex gap-1" role="radiogroup">
        {stars.map((starValue) => (
          <React.Fragment key={starValue}>
            <input
              type="radio"
              className="sr-only"
              id={`${id}.${starValue - 1}`}
              name={name}
              value={String(starValue)}
              required={required}
              checked={field.value === String(starValue)}
              onChange={() => helpers.setValue(String(starValue))}
            />
            <label
              htmlFor={`${id}.${starValue - 1}`}
              className="gc-star-rating__label cursor-pointer text-4xl leading-none select-none"
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(starValue)}
              onBlur={() => setHovered(null)}
            >
              <span
                className={
                  activeValue >= starValue
                    ? "gc-star-rating__star gc-star-rating__star--active text-yellow-400"
                    : "gc-star-rating__star text-gray-300"
                }
                aria-hidden="true"
              >
                ★
              </span>
              <span className="sr-only">{starValue}</span>
            </label>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
