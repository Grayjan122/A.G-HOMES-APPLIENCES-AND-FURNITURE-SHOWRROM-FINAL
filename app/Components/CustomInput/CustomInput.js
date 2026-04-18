import React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

/**
 * A reusable CustomInput component built with react-bootstrap.
 * 
 * Props:
 * - label: Text to display in the InputGroup.Text addon
 * - value: Controlled input value
 * - onChange: Handler for input changes (e.g., (e) => setState(e.target.value))
 * - name: Name attribute for the input
 * - type: Input type (default: 'text')
 * - size: Size of the input group ('sm', 'lg', or leave empty for default)
 * - placeholder: Placeholder text
 * - disabled: Boolean to disable the input
 * - className: Additional CSS classes (default: 'mb-3')
 * - id: Unique ID (auto-generated if not provided)
 */
const CustomInput = ({
    label,
    value,
    onChange,
    name,
    type = 'text',
    size, // 'sm' or 'lg'
    placeholder = '',
    className = 'mb-3',
    id,
    disabled = false,
    ...props
}) => {
    // Generate an ID for accessibility links if one isn't provided
    const inputId = id || `input-${name || Math.random().toString(36).substring(2, 9)}`;
    const addonId = `addon-${inputId}`;

    const isTextarea = type === 'textarea';

    return (
        <InputGroup size={size} className={className}>
            {label && (
                <InputGroup.Text id={addonId}>
                    {label}
                </InputGroup.Text>
            )}
            <Form.Control
                id={inputId}
                name={name}
                type={!isTextarea ? type : undefined}
                as={isTextarea ? 'textarea' : undefined}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                aria-label={label || placeholder || name || 'input'}
                aria-describedby={label ? addonId : undefined}
                {...props}
            />
        </InputGroup>
    );
};

export default CustomInput;
