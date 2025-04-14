import { FormField, TransferField } from '@/types/Checklist';

export const transformData = (data: FormField[]): TransferField[] => {
    return data.map((field) => {
        switch (field.type) {
            case 'radio':
                return {
                    radio: {
                        label: field.label,
                        name: field.name,
                        options: field.options?.map((option) => ({
                            text: option.text,
                            value: option.value,
                            color: option.color,
                            bgcolor: option.bgcolor,
                            selected: option.selected || false,
                        })) || [],
                    },
                };
            case 'text':
                return {
                    text: {
                        label: field.label,
                        value: field.value || '',
                        name: field.name,
                    },
                };
            case 'foto':
                return {
                    foto: {
                        value: field.value || [],
                        name: field.name,
                    },
                };
            case 'checkbox':
                return {
                    checkbox: {
                        label: field.label,
                        checked: field.checked || false,
                        name: field.name,
                    },
                };
            case 'select':
                return {
                    select: {
                        label: field.label,
                        options: field.options || [],
                        name: field.name,
                    },
                };
            default:
                return {};
        }
    });
};
