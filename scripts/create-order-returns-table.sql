CREATE TABLE IF NOT EXISTS order_returns (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    return_reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending', -- Например: Pending, Approved, Rejected, Completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE order_returns IS 'Таблица за заявки за връщане на поръчки.';
COMMENT ON COLUMN order_returns.id IS 'Уникален идентификатор на заявката за връщане.';
COMMENT ON COLUMN order_returns.first_name IS 'Име на клиента.';
COMMENT ON COLUMN order_returns.last_name IS 'Фамилия на клиента.';
COMMENT ON COLUMN order_returns.email IS 'Имейл адрес на клиента.';
COMMENT ON COLUMN order_returns.phone IS 'Телефонен номер на клиента.';
COMMENT ON COLUMN order_returns.product_name IS 'Име на продукта, който се връща.';
COMMENT ON COLUMN order_returns.quantity IS 'Количество на продукта, който се връща.';
COMMENT ON COLUMN order_returns.return_reason IS 'Причина за връщане на продукта.';
COMMENT ON COLUMN order_returns.status IS 'Текущ статус на заявката за връщане (напр. Pending, Approved).';
COMMENT ON COLUMN order_returns.created_at IS 'Дата и час на създаване на заявката.';
