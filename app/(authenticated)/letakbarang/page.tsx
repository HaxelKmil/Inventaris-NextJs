"use client";

import React, { useContext, useState, useRef } from 'react';
import { Button, Form, Input, Modal, Table, message, Row, Col, Card } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { FormInstance } from 'antd';

const EditableContext = React.createContext<FormInstance<any> | null>(null);
type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;
type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
  key: React.Key;
  letakbarang: string;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof DataType;
  record: DataType;
  handleSave: (record: DataType) => void;
  handleEdit: (record: DataType) => void;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  handleEdit,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const Page: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [count, setCount] = useState(0);
  const [letakBarang, setLetakBarang] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [editData, setEditData] = useState<DataType | null>(null);
  
  const handleSaveModalData = () => {
    if (!letakBarang) {
      message.error('Letak Barang harus diisi.');
      return;
    }
    
    const upperCaseLetakBarang = letakBarang.toUpperCase();
    
    if (editData) {
      const newData = dataSource.map(item => {
        if (item.key === editData.key) {
          return { ...item, letakbarang: upperCaseLetakBarang };
        }
        return item;
      });
      setDataSource(newData);
      setModalEditVisible(false);
      setEditData(null);
    } else {
      const newData: DataType = {
        key: count.toString(),
        letakbarang: upperCaseLetakBarang,
      };
      setDataSource([...dataSource, newData]);
      setCount(count + 1);
      setModalVisible(false);
    }

    setLetakBarang('');
  };

  // handle Edit 
  const handleEdit = (record: DataType) => {
    setEditData(record);
    setLetakBarang(record.letakbarang);
    setModalEditVisible(true);
  };

  // hanle modal simpan  
  const handleModalCancel = () => {
    setModalVisible(false);
    setModalEditVisible(false);
    setLetakBarang('');
  };


  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: 'Letak Barang',
      dataIndex: 'letakbarang',
      width: '80%',
      editable: true,
    },
    {
      title: '',
      dataIndex: '',
      render: (record: DataType) =>
        dataSource.length >= 1 ? (
          <span>
            <Button type="link" onClick={() => handleEdit(record)} icon={<EditOutlined />} />
          </span>
        ) : null,
    },
  ];

  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData);
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        handleEdit,
      }),
    };
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return (
    <div>
      <title>Letak Barang</title>
      <h1 style={{ fontSize: '25px', fontWeight: 'bold' }}>Letak Barang</h1>
      <Card style={{ width: '30%', marginTop: '100px'}}>
        <Button
          type="primary"
          onClick={() => setModalVisible(true)}
          icon={<PlusOutlined />}
          style={{ marginBottom: '16px', backgroundColor: 'white', color: 'black', display: 'flex', marginLeft: 'auto', right: '20px',boxShadow: '0px 7px 10px rgba(0, 0, 0, 0.1)'}}
        >
          Tambah Letak Barang
        </Button>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns as ColumnTypes}
          style={{ marginTop: '40px', width: '90%', marginLeft: '14px'}}
        />
        <Modal
          title="Tambah Letak Barang"
          visible={modalVisible}
          centered
          style={{ textAlign: 'center'}}
          onCancel={handleModalCancel}
          footer={[
            <Button key="cancel" onClick={handleModalCancel}>
              Batal
            </Button>,
            <Button key="save" type="primary" onClick={handleSaveModalData} style={{ backgroundColor: '#582DD2'}}>
              Simpan
            </Button>,
          ]}
        >
        <Row gutter={[24, 24]} style={{ marginTop: '50px', marginBottom: '20px'}}>
          <Col span={6}>
            <p>Letak Barang</p>
            </Col>
            <Col span={18}>
              <Input
                value={letakBarang}
                onChange={(e) => setLetakBarang(e.target.value)}
                placeholder="Masukkan letak barang"
                className="uppercase-input"
              />
            </Col>
          </Row>   
        </Modal>
        <Modal
          title="Edit Letak Barang"
          visible={modalEditVisible}
          centered
          style={{ textAlign: 'center'}}
          onCancel={handleModalCancel}
          footer={[
            <Button key="cancel" onClick={handleModalCancel}>
              Batal
            </Button>,
            <Button key="save" type="primary" onClick={handleSaveModalData} style={{ backgroundColor: '#582DD2'}}>
              Simpan
            </Button>,
          ]}
        >
        <Row gutter={[24, 24]} style={{ marginTop: '50px', marginBottom: '20px'}}>
            <Col span={6}>
              <p>Letak Barang</p>
            </Col>
            <Col span={18}>
              <Input
                value={letakBarang}
                onChange={(e) => setLetakBarang(e.target.value)}
                placeholder="Masukkan letak barang"
                className="uppercase-input"
              />
            </Col>
          </Row>
        </Modal>
      </Card>
    </div>
  );
};

export default Page;
