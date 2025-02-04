-- Create analytics functions
create or replace function get_analytics_summary(start_date timestamp)
returns table (
  total_revenue numeric,
  total_orders bigint,
  active_menu_items bigint,
  average_order_value numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    coalesce(sum(total_amount), 0) as total_revenue,
    count(*) as total_orders,
    (select count(*) from menu_items where is_available = true) as active_menu_items,
    case 
      when count(*) = 0 then 0 
      else coalesce(sum(total_amount) / count(*), 0) 
    end as average_order_value
  from orders
  where created_at >= start_date;
end;
$$;

create or replace function get_sales_data(start_date timestamp)
returns table (
  date text,
  revenue numeric,
  orders bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
    coalesce(sum(total_amount), 0) as revenue,
    count(*) as orders
  from orders
  where created_at >= start_date
  group by date_trunc('day', created_at)
  order by date_trunc('day', created_at);
end;
$$;

create or replace function get_menu_item_performance(start_date timestamp)
returns table (
  id uuid,
  name text,
  total_orders bigint,
  total_revenue numeric,
  average_order_value numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    mi.id,
    mi.name,
    count(distinct o.id) as total_orders,
    coalesce(sum(oi.quantity * oi.price), 0) as total_revenue,
    case 
      when count(distinct o.id) = 0 then 0 
      else coalesce(sum(oi.quantity * oi.price) / count(distinct o.id), 0)
    end as average_order_value
  from menu_items mi
  left join order_items oi on oi.menu_item_id = mi.id
  left join orders o on o.id = oi.order_id and o.created_at >= start_date
  group by mi.id, mi.name
  order by total_revenue desc;
end;
$$;

create or replace function get_customer_data(start_date timestamp)
returns table (
  new_customers bigint,
  total_customers bigint,
  repeat_rate numeric
)
language plpgsql
security definer
as $$
declare
  total_customers_count bigint;
  repeat_customers_count bigint;
begin
  -- Get total number of customers who have placed orders
  select count(distinct customer_id)
  into total_customers_count
  from orders
  where created_at >= start_date;

  -- Get number of new customers (first order within the period)
  with first_orders as (
    select 
      customer_id,
      min(created_at) as first_order_date
    from orders
    group by customer_id
  )
  select count(*)
  into new_customers
  from first_orders
  where first_order_date >= start_date;

  -- Get number of repeat customers (more than one order)
  select count(distinct customer_id)
  into repeat_customers_count
  from (
    select customer_id
    from orders
    where created_at >= start_date
    group by customer_id
    having count(*) > 1
  ) repeat_customers;

  -- Calculate repeat rate
  return query
  select 
    new_customers,
    total_customers_count as total_customers,
    case 
      when total_customers_count = 0 then 0
      else (repeat_customers_count::numeric / total_customers_count * 100)
    end as repeat_rate;
end;
$$; 