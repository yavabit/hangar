import { FC, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { ProjectList } from '../../shared/components/Project/ProjectList';
import { Filters } from '../../shared/components/Filters/Filters';

export const Favorites: FC = () => {

	const [addModalOpen, setAddModalOpen] = useState(false);

  return (
	<div>
		<div className="page-title">Избранное</div>
		<Filters/>
		<Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
          Добавить проект
        </Button>
		<div className="project-list" style={{ marginTop: 20 }}>
			<ProjectList addModalOpen={addModalOpen} onCloseModal={() => setAddModalOpen(false)} />
		</div>
	</div>
  )
}
