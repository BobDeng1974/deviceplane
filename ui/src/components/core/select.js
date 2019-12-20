import React from 'react';
import ReactSelect, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import theme from '../../theme';

const styles = {
  container: () => ({
    display: 'flex',
    flex: 1,
    position: 'relative',
  }),
  option: (provided, { isFocused, isSelected, selectProps: { variant } }) => ({
    transition: 'background-color 150ms',
    backgroundColor: isFocused
      ? theme.colors.grays[1]
      : isSelected
      ? theme.colors.white
      : variant === 'black'
      ? theme.colors.black
      : theme.colors.grays[0],
    cursor: isSelected ? 'default' : 'pointer',
    color: isSelected ? theme.colors.black : theme.colors.white,
    padding: 8,
    width: '100%',
    margin: 0,
    ':hover': {
      backgroundColor: isSelected ? theme.colors.white : theme.colors.grays[1],
    },
  }),
  menu: (provided, { selectProps: { variant } }) => ({
    ...provided,
    marginTop: '4px',
    backgroundColor:
      variant === 'black' ? theme.colors.black : theme.colors.grays[0],
    borderRadius: `${theme.radii[1]}px`,
    border: `1px solid ${theme.colors.white}`,
  }),
  control: (provided, { selectProps: { variant } }) => ({
    // none of react-select's styles are passed to <Control />
    display: 'flex',
    flex: 1,
    padding: 0,
    backgroundColor:
      variant === 'black' ? theme.colors.black : theme.colors.grays[0],
    border: `1px solid ${theme.colors.white}`,
    borderRadius: `${theme.radii[1]}px`,
  }),
  input: () => ({
    fontSize: theme.fontSizes[2],
    color: theme.colors.grays[10],
  }),
  multiValue: provided => {
    return {
      ...provided,
      color: theme.colors.black,
      backgroundColor: theme.colors.white,
      margin: '4px',
    };
  },
  multiValueRemove: provided => {
    return {
      ...provided,
      ':hover': {
        backgroundColor: theme.colors.black,
        color: theme.colors.red,
      },
      cursor: 'pointer',
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      color: theme.colors.black,
      backgroundColor: theme.colors.red,
    };
  },
  singleValue: provided => {
    return { ...provided, color: theme.colors.grays[10] };
  },
  dropdownIndicator: provided => ({
    ...provided,
    cursor: 'pointer',
    color: theme.colors.white,
    ':hover': {
      color: theme.colors.black,
      backgroundColor: theme.colors.white,
    },
  }),
  clearIndicator: provided => ({
    ...provided,
    cursor: 'pointer',
    color: theme.colors.red,
    ':hover': {
      color: theme.colors.white,
    },
  }),
  indicatorSeparator: () => ({
    width: '1px',
    height: '100%',
    backgroundColor: 'white',
  }),
};

const Option = props => {
  if (props.selectProps.optionComponent) {
    return (
      <components.Option {...props}>
        <props.selectProps.optionComponent {...props} {...props.data.props} />
      </components.Option>
    );
  }
  return <components.Option {...props} />;
};

const SingleValue = props => {
  if (props.selectProps.singleComponent) {
    return (
      <props.selectProps.singleComponent {...props} {...props.data.props} />
    );
  }
  return <components.SingleValue {...props} />;
};
const MultiValueLabel = props => {
  if (props.selectProps.multiComponent) {
    return (
      <props.selectProps.multiComponent {...props} {...props.data.props} />
    );
  }
  return <components.MultiValue {...props} />;
};

const Select = ({ searchable, multi, disabled, creatable, ...props }) => {
  if (creatable) {
    return <CreatableSelect styles={styles} {...props} />;
  }
  return (
    <ReactSelect
      styles={styles}
      isSearchable={searchable}
      isDisabled={disabled}
      isMulti={multi}
      components={{ Option, MultiValueLabel, SingleValue }}
      closeMenuOnSelect={multi ? false : true}
      {...props}
    />
  );
};

export default Select;
