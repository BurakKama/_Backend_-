const joi = require("joi");

class authValidation {
    constructor() {}

    // Kayıt işlemi için validasyon
    static register = async (req, res, next) => {
        try {
            const schema = joi.object({
                name: joi.string().trim().min(3).max(100).required().messages({
                    "string.base": "İsim alanı metin olmalıdır.",
                    "string.empty": "İsim alanı boş olamaz.",
                    "string.min": "İsim en az 3 karakterden oluşmalıdır.",
                    "string.max": "İsim en fazla 100 karakterden oluşabilir.",
                    "string.required": "İsim alanı zorunludur."
                }),
                lastname: joi.string().trim().min(3).max(100).required().messages({
                    "string.base": "Soyad alanı metin olmalıdır.",
                    "string.empty": "Soyad alanı boş olamaz.",
                    "string.min": "Soyad en az 3 karakterden oluşmalıdır.",
                    "string.max": "Soyad en fazla 100 karakterden oluşabilir.",
                    "string.required": "Soyad alanı zorunludur."
                }),
                email: joi.string().email().trim().min(5).max(100).required().messages({
                    "string.base": "E-posta alanı metin olmalıdır.",
                    "string.empty": "E-posta alanı boş olamaz.",
                    "string.min": "E-posta en az 5 karakterden oluşmalıdır.",
                    "string.email": "Geçerli bir e-posta adresi giriniz.",
                    "string.max": "E-posta en fazla 100 karakterden oluşabilir.",
                    "string.required": "E-posta alanı zorunludur."
                }),
                password: joi.string().trim().min(6).max(36).required().messages({
                    "string.base": "Şifre alanı metin olmalıdır.",
                    "string.empty": "Şifre alanı boş olamaz.",
                    "string.min": "Şifre en az 6 karakterden oluşmalıdır.",
                    "string.max": "Şifre en fazla 36 karakterden oluşabilir.",
                    "string.required": "Şifre alanı zorunludur."
                }),
                confirmpassword: joi.string().valid(joi.ref('password')).required().messages({
                    "any.only": "Şifreler eşleşmiyor.",
                    "string.empty": "Şifre onayı alanı boş olamaz.",
                    "string.required": "Şifre onayı alanı zorunludur."
                })
            });

            await schema.validateAsync(req.body);
            next(); // Validasyon başarılıysa bir sonraki middleware'e geç
        } catch (error) {
            const errorMessage = error.details ? error.details.map(detail => detail.message).join(", ") : "Lütfen validasyon kurallarına uyunuz.";
            res.status(400).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    // Giriş işlemi için validasyon
    static login = async (req, res, next) => {
        try {
            const schema = joi.object({
                email: joi.string().email().trim().min(5).max(100).required().messages({
                    "string.base": "E-posta alanı metin olmalıdır.",
                    "string.empty": "E-posta alanı boş olamaz.",
                    "string.min": "E-posta en az 5 karakterden oluşmalıdır.",
                    "string.email": "Geçerli bir e-posta adresi giriniz.",
                    "string.max": "E-posta en fazla 100 karakterden oluşabilir.",
                    "string.required": "E-posta alanı zorunludur."
                }),
                password: joi.string().trim().min(6).max(36).required().messages({
                    "string.base": "Şifre alanı metin olmalıdır.",
                    "string.empty": "Şifre alanı boş olamaz.",
                    "string.min": "Şifre en az 6 karakterden oluşmalıdır.",
                    "string.max": "Şifre en fazla 36 karakterden oluşabilir.",
                    "string.required": "Şifre alanı zorunludur."
                })
            });

            await schema.validateAsync(req.body);
            next(); 
        } catch (error) {
            const errorMessage = error.details ? error.details.map(detail => detail.message).join(", ") : "Lütfen validasyon kurallarına uyunuz.";
            res.status(400).json({
                success: false,
                message: errorMessage,
            });
        }
    }
}

module.exports = authValidation;
