import { FC, useMemo, useState } from "react";
import { Alert, Button, Checkbox, Empty, Flex, Form, InputNumber, Modal, Select, Spin, Tag, Typography } from "antd";
import { BranchesOutlined, FolderOutlined, SearchOutlined } from "@ant-design/icons";
import { SelectFolder } from "@renderer/shared/components/SelectFolder/SelectFolder";
import { ProjectPath } from "@renderer/shared/components/ProjectPath/ProjectPath";
import { useAppStore } from "@renderer/store/app.store";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { usePathAliases } from "@renderer/shared/hooks/usePathAliases";
import { projectsApi } from "@renderer/shared/api/projects.api";
import { getIpcErrorMessage } from "@renderer/shared/utils/ipcError";
import { pluralize } from "@renderer/shared/utils/pluralize";
import type { ScanCandidate } from "@common/api/api.types";
import type { Folder } from "@schemas/store.schema";

import "./ImportProjectsModal.scss";

type ImportProjectsModalProps = {
	isOpen: boolean;
	onClose: () => void;
	/** Папка лаунчера, в которую добавить проекты по умолчанию */
	defaultFolderId?: Folder["id"];
};

const normalizePath = (path: string): string => path.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();

export const ImportProjectsModal: FC<ImportProjectsModalProps> = ({ isOpen, onClose, defaultFolderId }) => {
	const folders = useAppStore((s) => s.folders);
	const projects = useAppStore((s) => s.projects);
	const { addProjects } = useProjects();
	const { resolvePath } = usePathAliases();

	const [rootPath, setRootPath] = useState<string>();
	const [depth, setDepth] = useState(2);
	const [folderId, setFolderId] = useState<Folder["id"] | undefined>(defaultFolderId);
	const [candidates, setCandidates] = useState<ScanCandidate[] | null>(null);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [scanning, setScanning] = useState(false);
	const [importing, setImporting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const existingPaths = useMemo(
		() => new Set(projects.map((p) => normalizePath(resolvePath(p.path)))),
		[projects, resolvePath],
	);

	const isExisting = (candidate: ScanCandidate): boolean => existingPaths.has(normalizePath(resolvePath(candidate.path)));

	const available = candidates?.filter((c) => !isExisting(c)) ?? [];

	const reset = (): void => {
		setRootPath(undefined);
		setCandidates(null);
		setSelected(new Set());
		setError(null);
		setFolderId(defaultFolderId);
	};

	const handleClose = (): void => {
		reset();
		onClose();
	};

	const handleScan = async (): Promise<void> => {
		if (!rootPath) {
			return;
		}

		setScanning(true);
		setError(null);
		try {
			const found = await projectsApi.scan(rootPath, depth);
			setCandidates(found);
			setSelected(new Set(found.filter((c) => !isExisting(c)).map((c) => c.path)));
		} catch (e) {
			setError(getIpcErrorMessage(e));
		} finally {
			setScanning(false);
		}
	};

	const toggle = (path: string, checked: boolean): void => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (checked) {
				next.add(path);
			} else {
				next.delete(path);
			}
			return next;
		});
	};

	const handleImport = async (): Promise<void> => {
		const items = available.filter((c) => selected.has(c.path));
		if (!items.length) {
			return;
		}

		setImporting(true);
		try {
			await addProjects(
				items.map((c) => ({
					name: c.name,
					path: c.path,
					gitUrl: c.gitUrl,
					folderId,
					isFavorite: false,
				})),
			);
			handleClose();
		} catch (e) {
			console.log(e);
		} finally {
			setImporting(false);
		}
	};

	const allChecked = available.length > 0 && available.every((c) => selected.has(c.path));
	const someChecked = available.some((c) => selected.has(c.path));
	const selectedCount = available.filter((c) => selected.has(c.path)).length;

	return (
		<Modal
			title="Импорт проектов"
			open={isOpen}
			onCancel={handleClose}
			width={720}
			centered
			styles={{ body: { maxHeight: "calc(100vh - 200px)", overflowY: "auto", paddingRight: 4 } }}
			destroyOnHidden
			footer={[
				<Button key="cancel" onClick={handleClose}>
					Отмена
				</Button>,
				<Button
					key="import"
					type="primary"
					disabled={!selectedCount}
					loading={importing}
					onClick={handleImport}
				>
					{selectedCount
						? `Добавить ${selectedCount} ${pluralize(selectedCount, ["проект", "проекта", "проектов"])}`
						: "Добавить"}
				</Button>,
			]}
		>
			<Typography.Paragraph type="secondary">
				Выберите папку, в которой лежат проекты. Проектом считается папка с <code>.git</code> или файлом
				вроде <code>package.json</code>, <code>pyproject.toml</code>, <code>go.mod</code>. Пути внутри алиасов
				сохранятся через алиас.
			</Typography.Paragraph>

			<Form layout="vertical">
				<Form.Item label="Где искать">
					<SelectFolder onSelect={setRootPath} />
				</Form.Item>
				<Flex gap={16} align="end" wrap="wrap">
					<Form.Item label="Глубина поиска" tooltip="Сколько уровней вложенных папок просматривать" style={{ marginBottom: 0 }}>
						<InputNumber min={1} max={5} value={depth} onChange={(v) => setDepth(v ?? 2)} />
					</Form.Item>
					<Form.Item label="Добавить в папку" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
						<Select
							value={folderId}
							onChange={setFolderId}
							placeholder="Без папки"
							allowClear
							options={folders.map((f) => ({
								value: f.id,
								label: (
									<span>
										<FolderOutlined style={{ marginRight: 8 }} />
										{f.name}
									</span>
								),
							}))}
						/>
					</Form.Item>
					<Button type="primary" ghost icon={<SearchOutlined />} disabled={!rootPath} loading={scanning} onClick={handleScan}>
						Найти проекты
					</Button>
				</Flex>
			</Form>

			{error && <Alert type="error" showIcon title={error} style={{ marginTop: 16 }} />}

			{scanning && (
				<div style={{ textAlign: "center", padding: 32 }}>
					<Spin description="Ищем проекты…" />
				</div>
			)}

			{!scanning && candidates && (
				<div className="import-list">
					{candidates.length === 0 ? (
						<Empty description="Проекты не найдены. Попробуйте увеличить глубину поиска" />
					) : (
						<>
							<div className="import-list__header">
								<Checkbox
									checked={allChecked}
									indeterminate={someChecked && !allChecked}
									disabled={!available.length}
									onChange={(e) =>
										setSelected(e.target.checked ? new Set(available.map((c) => c.path)) : new Set())
									}
								>
									Найдено {candidates.length}, новых {available.length}
								</Checkbox>
							</div>
							<div className="import-list__items">
								{candidates.map((candidate) => {
									const exists = isExisting(candidate);

									return (
										<label
											key={candidate.path}
											className={`import-list__item ${exists ? "import-list__item--disabled" : ""}`}
										>
											<Checkbox
												checked={!exists && selected.has(candidate.path)}
												disabled={exists}
												onChange={(e) => toggle(candidate.path, e.target.checked)}
											/>
											<div className="import-list__info">
												<div className="import-list__name">
													{candidate.name}
													{candidate.hasGit && (
														<Tag icon={<BranchesOutlined />} bordered={false}>
															git
														</Tag>
													)}
													{exists && <Tag color="default">уже добавлен</Tag>}
												</div>
												<ProjectPath path={candidate.path} />
											</div>
										</label>
									);
								})}
							</div>
						</>
					)}
				</div>
			)}
		</Modal>
	);
};
