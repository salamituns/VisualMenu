-- Create function to update user role
CREATE OR REPLACE FUNCTION update_user_role(user_email TEXT, new_role_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE auth.users
    SET role_id = new_role_id
    WHERE email = user_email;
END;
$$; 