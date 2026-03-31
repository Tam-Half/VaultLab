const testDataService = require('../services/vaultDataTestService');

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
    }


};

module.exports = TestDataController;