import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import SplitButton from 'react-bootstrap/SplitButton';

/**
 * A reusable SegmentedInput component built with react-bootstrap.
 * Allows the user to select a category/type from a dropdown alongside a text input.
 *
 * Props:
 * - options: Array of objects { label: 'Item 1', value: 'item-1' }
 * - selectedLabel: The text to display on the dropdown button
 * - onOptionSelect: Handler called when a dropdown item is clicked (receives the 'value')
 * - inputValue: The value of the text input
 * - onInputChange: Handler for the text input (e.g., (e) => setValue(e.target.value))
 * - placeholder: Placeholder text for the input
 * - buttonVariant: Bootstrap variant for the button (default: 'outline-secondary')
 * - position: 'left' or 'right' - positions the dropdown button (default: 'left')
 * - size: Size of the input group ('sm', 'lg')
 * - className: Additional CSS classes (default: 'mb-3')
 * - id: Unique ID (auto-generated if not provided)
 */
const SegmentedInput = ({
    options = [],
    selectedLabel = 'Select Option',
    onOptionSelect,
    inputValue,
    onInputChange,
    placeholder = '',
    buttonVariant = 'outline-secondary',
    position = 'left',
    size,
    className = 'mb-3',
    id,
    ...props
}) => {
    // Generate a unique ID for the dropdown if none provided
    const dropdownId = id || `segmented-dropdown-${Math.random().toString(36).substring(2, 9)}`;

    const renderDropdown = () => (
        <SplitButton
            variant={buttonVariant}
            title={selectedLabel}
            id={dropdownId}
            align={position === 'right' ? 'end' : 'start'}
        >
            {options.map((option, index) => {
                if (option.divider) {
                    return <Dropdown.Divider key={`divider-${index}`} />;
                }
                return (
                    <Dropdown.Item
                        key={option.value || index}
                        onClick={() => onOptionSelect && onOptionSelect(option.value, option)}
                    >
                        {option.label}
                    </Dropdown.Item>
                );
            })}
        </SplitButton>
    );

    return (
        <InputGroup size={size} className={className}>
            {position === 'left' && renderDropdown()}
            
            <Form.Control
                aria-label="Text input with dropdown button"
                value={inputValue}
                onChange={onInputChange}
                placeholder={placeholder}
                {...props}
            />

            {position === 'right' && renderDropdown()}
        </InputGroup>
    );
};

export default SegmentedInput;
