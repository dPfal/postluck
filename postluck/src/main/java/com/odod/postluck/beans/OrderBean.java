package com.odod.postluck.beans;

import java.util.ArrayList;

import lombok.Data;

@Data
public class OrderBean {
	private String orderDate;							//주문일시
	private String orderPaymentType; 					//결제방식
	private String orderState; 							//주문상태 처리/접수
	private ArrayList<OrderDetailBean> orderMenuList;	//주문메뉴리스트
	private SalesBean sales;							//결제정보
}