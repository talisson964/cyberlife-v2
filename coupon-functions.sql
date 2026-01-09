-- Função para incrementar o contador de uso de cupons
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code text)
RETURNS void AS $$
BEGIN
  UPDATE public.coupons 
  SET current_uses = COALESCE(current_uses, 0) + 1
  WHERE code = coupon_code 
    AND is_active = true 
    AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
    AND (max_uses IS NULL OR COALESCE(current_uses, 0) < max_uses);
END;
$$ LANGUAGE plpgsql;

-- Função para validar cupom disponível
CREATE OR REPLACE FUNCTION validate_coupon_availability(coupon_code text)
RETURNS json AS $$
DECLARE
    result json;
    coupon_record RECORD;
BEGIN
    SELECT * INTO coupon_record 
    FROM public.coupons 
    WHERE code = coupon_code 
      AND is_active = true;
    
    IF NOT FOUND THEN
        result := json_build_object(
            'valid', false, 
            'message', 'Cupom não encontrado ou inativo'
        );
        RETURN result;
    END IF;
    
    -- Verificar data de validade
    IF coupon_record.valid_until IS NOT NULL AND coupon_record.valid_until < CURRENT_DATE THEN
        result := json_build_object(
            'valid', false, 
            'message', 'Cupom expirado'
        );
        RETURN result;
    END IF;
    
    -- Verificar limite de uso
    IF coupon_record.max_uses IS NOT NULL AND 
       COALESCE(coupon_record.current_uses, 0) >= coupon_record.max_uses THEN
        result := json_build_object(
            'valid', false, 
            'message', 'Cupom esgotado'
        );
        RETURN result;
    END IF;
    
    -- Cupom válido
    result := json_build_object(
        'valid', true,
        'coupon', row_to_json(coupon_record)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;