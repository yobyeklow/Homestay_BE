const validate = {
    validateBeforeRegister: (data) => {
			const { email, phoneNumber, name, password } = data;
			const err = {};

			if (!name) {
					err.name = "Vui lòng nhập tên của bạn";
			} else if (name.length > 30) {
					err.name = "Tên không vượt quá 20 ký tự";
			}

			if (!email) {
					err.email = "Vui lòng nhập email của bạn";
			} else if (!email.match(
					/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			)) {
					err.email = "Định dạng email không đúng"
			}

			
			if (!phoneNumber) {
					err.phoneNumber = "Vui lòng nhập số điện thoại";
			} else if (!phoneNumber.match(/(0[3|5|7|8|9])+([0-9]{8})\b/)) {
					err.phoneNumber = "Số điện thoại không đúng."
			}

			if (!password) {
					err.password = "Vui lòng nhập mật khẩu của bạn"
			} else if (password.length < 8) {
					err.password = "Mật khẩu phải có ít nhất 8 ký tự"
			} else if(password.length > 20) {
					err.password = "Mật khẩu không vượt quá 20 ký tự"
			}
			return err
    },

		validateBeforeLogin: (data) => {
			const { email, password } = data;
			const err = {};

			if (!email) {
					err.email = "Vui lòng nhập email của bạn";
			} else if (!email.match(
					/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			)) {
					err.email = "Định dạng email không đúng"
			}

			if (!password) {
					err.password = "Vui lòng nhập mật khẩu của bạn"
			}
			
			return err
    }
}
export default validate