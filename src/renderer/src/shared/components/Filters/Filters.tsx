import { Search } from "@renderer/shared/components/Search/Search";
import { Form, Switch } from "antd";
import { FC } from "react";

type FormValues = {
	search?: string;
	onlyProjects?: boolean;
	withoutFolder?: boolean;
};

type FiltersProps = {
	onFiltersChange: (formValues: FormValues) => void;
	showSwitchProjects?: boolean;
	showSwitchFolders?: boolean;
};

export const Filters: FC<FiltersProps> = ({
	showSwitchProjects = false,
	showSwitchFolders = false,
	onFiltersChange,
}) => {
	const [form] = Form.useForm<FormValues>();

	const onFormChange = (): void => {
		const formValues = form.getFieldsValue();
		onFiltersChange(formValues);
	};

	return (
		<div>
			<Form form={form} onValuesChange={onFormChange}>
				<Form.Item name="search">
					<Search placeholder="Поиск проектов..." />
				</Form.Item>
				{showSwitchProjects && (
					<Form.Item label="Показать только проекты" name="onlyProjects">
						<Switch />
					</Form.Item>
				)}
				{showSwitchFolders && (
					<Form.Item label="Только проекты без папок" name="withoutFolder">
						<Switch />
					</Form.Item>
				)}
			</Form>
		</div>
	);
};
