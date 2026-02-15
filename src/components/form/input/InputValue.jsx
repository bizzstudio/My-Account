import { Input } from "@windmill/react-ui";

const InputValue = ({
  name,
  label,
  type,
  disabled,
  register,
  required,
  maxValue,
  minValue,
  currency,
  product,
  defaultValue,
  placeholder,
  onChange,
}) => {
  const value = {
    valueAsNumber: true,
    required: required ? false : `${label} is required!`,
    max: {
      value: maxValue,
      message: `Maximum value ${maxValue}!`,
    },
    min: {
      value: minValue,
      message: `Minimum value ${minValue}!`,
    },
    pattern: {
      value: /^[0-9]*$/,
      message: `Invalid ${label}!`,
    },
  };

  return (
    <>
      <div className={`flex flex-row`}>
        <Input
          {...register(`${name}`, value)}
          type={type}
          name={name}
          step={type === "number" ? 'any' : undefined}
          disabled={disabled}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChange={onChange}
          className={`p-2 ${product && "rounded-l-none"}`}
        />
        {product && (
          <span className="inline-flex items-center px-3 rounded rounded-r-none border border-r-0 border-gray-200 bg-gray-100 text-gray-500 text-sm focus:border-customBrown-light dark:bg-gray-700 dark:text-gray-300 dark:border dark:border-gray-600">
            {currency}
          </span>
        )}
      </div>
    </>
  );
};

export default InputValue;
