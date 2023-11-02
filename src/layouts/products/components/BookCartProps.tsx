import { Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TextEllipsis from "./text-ellipsis/TextEllipsis";
import SelectQuantity from "./select-quantity/SelectQuantity";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CartItemModel from "../../../model/CartItemModel";
import { getAllImageByBook } from "../../../api/ImageApi";
import ImageModel from "../../../model/ImageModel";
import ConfirmDialog from "../../utils/ConfirmDialog";

interface BookCartProps {
	cartItem: CartItemModel;
	handleRemoveBook: any;
	setTotalCart: any;
}

const BookCartProps: React.FC<BookCartProps> = (props) => {
	// Tạo các biến
	const [quantity, setQuantity] = useState(props.cartItem.quantity);
	const [imageList, setImageList] = useState<ImageModel[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [erroring, setErroring] = useState(null);

	// Tạo các biến của confirm dialog
	const [open, setOpen] = useState(false);

	const handleClickOpenConfirm = () => {
		setOpen(true);
	};
	const handleCloseConfirm = () => {
		setOpen(false);
	};

	function handleStateConfirm(status: boolean) {
		if (status === true) {
			props.handleRemoveBook(props.cartItem.book.idBook);
		}
		handleCloseConfirm();
	}

	// Lấy ảnh ra từ BE
	useEffect(() => {
		getAllImageByBook(props.cartItem.book.idBook)
			.then((response) => {
				setImageList(response);
				setLoading(false);
			})
			.catch((error) => {
				setLoading(false);
				setErroring(error.message);
			});
	}, []);

	// Loading ảnh thumbnail
	let dataImage;
	if (imageList[0] && imageList[0].dataImage) {
		// Từ đầu hình ảnh sẽ mặc định thumbnail là ảnh đầu tiên
		dataImage = imageList[0].dataImage;
		// Duyệt qua tất cả các ảnh của sách đó nếu mà có ảnh nào có thumnail là true thì gán lại nó là thumnail
		for (let img of imageList) {
			if (img.isThumbnail === true) {
				dataImage = img.dataImage;
				break;
			}
		}
	}

	// Xử lý tăng/giảm số lượng
	const add = () => {
		if (quantity) {
			if (
				quantity <
				(props.cartItem.book.quantity ? props.cartItem.book.quantity : 1)
			) {
				setQuantity(quantity + 1);
				handleModifiedQuantity(props.cartItem.book.idBook, 1);
			}
		}
	};

	const reduce = () => {
		if (quantity) {
			if (quantity - 1 === 0) {
				props.handleRemoveBook(props.cartItem.book.idBook);
			} else if (quantity > 1) {
				setQuantity(quantity - 1);
				handleModifiedQuantity(props.cartItem.book.idBook, -1);
			}
		}
	};

	// Xử lý cập nhật lại quantity trong localstorage / database
	function handleModifiedQuantity(idBook: number, quantity: number) {
		const cartData: string | null = localStorage.getItem("cart");
		const cart: CartItemModel[] = cartData ? JSON.parse(cartData) : [];
		// cái isExistBook này sẽ tham chiếu đến cái cart ở trên, nên khi update thì cart nó cũng update theo
		let isExistBook = cart.find(
			(cartItem) => cartItem.book.idBook === idBook
		);
		// Thêm 1 sản phẩm vào giỏ hàng
		if (isExistBook) {
			// nếu có rồi thì sẽ tăng số lượng
			isExistBook.quantity += quantity;
		}
		// Cập nhật lại
		localStorage.setItem("cart", JSON.stringify(cart));
	}

	return (
		<>
			<div className='col'>
				<Link to={"/"}>
					<div className='d-flex'>
						<img
							src={dataImage}
							className='card-img-top'
							alt={props.cartItem.book.nameBook}
							style={{ width: "100px" }}
						/>
						<div className='d-flex flex-column pb-2'>
							<Tooltip title={props.cartItem.book.nameBook} arrow>
								<span className='d-inline'>
									<TextEllipsis
										text={props.cartItem.book.nameBook + " "}
										limit={38}
									/>
								</span>
							</Tooltip>
							<div className='mt-auto'>
								<span className='discounted-price text-danger'>
									<strong style={{ fontSize: "22px" }}>
										{props.cartItem.book.sellPrice.toLocaleString()}đ
									</strong>
								</span>
								<span
									className='original-price ms-3 small'
									style={{ color: "#000" }}
								>
									<del>
										{props.cartItem.book.listPrice.toLocaleString()}đ
									</del>
								</span>
							</div>
						</div>
					</div>
				</Link>
			</div>
			<div className='col-3 text-center my-auto d-flex align-items-center justify-content-center'>
				<SelectQuantity
					max={props.cartItem.book.quantity}
					setQuantity={setQuantity}
					quantity={quantity}
					add={add}
					reduce={reduce}
					book={props.cartItem.book}
				/>
			</div>
			<div className='col-2 text-center my-auto'>
				<span className='text-danger'>
					<strong>
						{(quantity * props.cartItem.book.sellPrice).toLocaleString()}đ
					</strong>
				</span>
			</div>
			<div className='col-2 text-center my-auto'>
				<ConfirmDialog
					open={open}
					setOpen={setOpen}
					handleClickOpenConfirm={handleClickOpenConfirm}
					handleCloseConfirm={handleCloseConfirm}
					handleStateConfirm={handleStateConfirm}
					notification='BẠN MUỐN XOÁ SẢN PHẨM NÀY KHỎI GIỎ HÀNG?'
				>
					<Tooltip title={"Xoá sản phẩm"} arrow>
						<span
							style={{
								outline: 0,
								backgroundColor: "transparent",
								border: 0,
							}}
							onClick={() => handleClickOpenConfirm}
						>
							<DeleteOutlineOutlinedIcon sx={{ cursor: "pointer" }} />
						</span>
					</Tooltip>
				</ConfirmDialog>
			</div>
			<hr className='my-3' />
		</>
	);
};

export default BookCartProps;
