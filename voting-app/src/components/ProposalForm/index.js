import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Textarea,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";

const InputField = ({ name, label, ...props }) => (
  <Field name={name}>
    {({ field, form }) => (
      <FormControl
        mb={3}
        isInvalid={form.errors[name] && form.touched[name]}
        isRequired={props.isRequired}
      >
        <FormLabel htmlFor={name}>{label}</FormLabel>
        <Input {...field} id={name} {...props} />
        <FormErrorMessage>{form.errors[name]}</FormErrorMessage>
      </FormControl>
    )}
  </Field>
);
const TextField = ({ name, label, ...props }) => (
  <Field name={name}>
    {({ field, form }) => (
      <FormControl
        mb={3}
        isInvalid={form.errors[name] && form.touched[name]}
        isRequired={props.isRequired}
      >
        <FormLabel htmlFor={name}>{label}</FormLabel>
        <Textarea {...field} id={name} {...props} />
        <FormErrorMessage>{form.errors[name]}</FormErrorMessage>
      </FormControl>
    )}
  </Field>
);

const NumberField = ({ name, label, ...props }) => (
  <Field name={name}>
    {({ field, form }) => (
      <FormControl
        mb={3}
        isInvalid={form.errors[name] && form.touched[name]}
        isRequired={props.isRequired}
      >
        <FormLabel htmlFor={name}>{label}</FormLabel>
        <NumberInput min={0} id={name} {...field}>
          <NumberInputField id={name} {...field} />
        </NumberInput>
        <FormErrorMessage>{form.errors[name]}</FormErrorMessage>
      </FormControl>
    )}
  </Field>
);

const ProposalForm = ({ initialValues, onSubmit }) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values, { setSubmitting }) =>
        onSubmit({
          ...values,
          amount: Number(values.amount),
        }).then(() => setSubmitting(false))
      }
    >
      {({ handleSubmit, isSubmitting }) => (
        <Form onSubmit={handleSubmit}>
          <InputField name="context" label="Context" disabled isRequired />
          <InputField
            name="title"
            label="Title"
            placeholder="Develop an off-chain conviction voting system"
            isRequired
          />
          <InputField
            name="currency"
            label="Currency"
            placeholder="ETH"
            isRequired
          />
          <NumberField name="amount" label="Amount" />
          <InputField
            name="beneficiary"
            label="Beneficiary"
            placeholder="Receiving address when amount is reached"
            isRequired
          />
          <TextField
            name="description"
            label="description"
            placeholder="Fund team X to implement off-chain conviction voting using Ceramic & IDX."
          />
          <InputField name="url" label="URL" isRequired />

          <Flex justifyContent="flex-end">
            <Button mt={4} type="submit" disabled={isSubmitting}>
              Create
            </Button>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default ProposalForm;
