const testDataService = require('../services/vaultDataTestService');
const VaultDataService = require('../services/VaultDataService');
const TestDataController = {
    async createSecureRecord(req, res, next) {
        try {
            const { payment_id, phone, address } = req.body;

            // Validate cơ bản
            if (!payment_id || !phone || !address) {
                return res.status(400).json({ message: "Thiếu các trường dữ liệu bắt buộc!" });
            }

            // Gọi Service để xử lý
            const result = await testDataService.addSecureData({ payment_id, phone, address });

            // Trả về kết quả
            res.status(201).json({
                message: "✅ Thêm dữ liệu và mã hóa thành công!",
                data: result
            });

        } catch (error) {
            console.error('❌ Controller Error:', error.message);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },


    async getSecureRecordById(req, res, next) {
        try {
            const id = req.params.id; // Lấy ID từ URL

            const result = await testDataService.getSecureDataById(id);

            if (!result) {
                return res.status(404).json({ message: "❌ Không tìm thấy dữ liệu với ID này!" });
            }

            res.status(200).json({
                message: "✅ Lấy dữ liệu và giải mã thành công!",
                data: result
            });

        } catch (error) {
            console.error('❌ Controller Error:', error.message);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // controllers/vaultController.js (hoặc file tương đương của bạn)

    async encryptAndDownload(req, res) {
        try {
            // req.file có được là do bạn dùng middleware upload.single('file') của multer ở Route
            if (!req.file) {
                return res.status(400).json({ message: "Vui lòng chọn một file để upload!" });
            }

            const inputFilePath = req.file.path; // Đường dẫn file tạm trên server
            const originalFileName = req.file.originalname; // Tên file lúc upload (VD: bao_cao.docx)

            // Gọi Service để mã hóa
            const result = await VaultDataService.encryptWordAndSave(inputFilePath, originalFileName);

            console.log("✅ Mã hóa thành công, đang gửi file về cho Client...");

            // Lệnh quan trọng nhất để trình duyệt tải file về:
            // Tham số 1: Đường dẫn file vật lý trên server
            // Tham số 2: Tên file sẽ hiển thị khi user tải về máy họ
            return res.download(result.downloadPath, result.encryptedFileName, (err) => {
                if (err) {
                    console.error("Lỗi khi tải file:", err);
                    if (!res.headersSent) {
                        res.status(500).json({ message: "Lỗi tải file về máy." });
                    }
                }
            });

        } catch (error) {
            console.error("❌ Controller Error:", error.message);
            return res.status(500).json({ message: error.message });
        }
    }


};

module.exports = TestDataController;