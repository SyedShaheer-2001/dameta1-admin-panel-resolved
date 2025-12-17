'use client'

import Link from "next/link";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import { useContext } from "react";
import config from '@/app/context/config'
import { CustomizerContext } from "@/app/context/customizerContext";

const Logo = () => {
  const { isCollapse, isSidebarHover, activeDir, activeMode } = useContext(CustomizerContext);

  const TopbarHeight = config.topbarHeight;

  const LinkStyled = styled(Link)(() => ({
    height: TopbarHeight,
    width: isCollapse == "mini-sidebar" && !isSidebarHover ? '40px' : '180px',
    overflow: "hidden",
    display: "block",
  }));

  if (activeDir === "ltr") {
    return (
      <LinkStyled href="/">
        {activeMode === "dark" ? (
          <Image
          style={{marginTop:'10px'}}
            src="/images/logos/logo.webp"
            alt="logo"
             height={TopbarHeight-20}
            width={50}
            priority
          />
        ) : (
          <Image
          style={{marginTop:'10px'}}
            src={"/images/logos/logo.webp"}
            alt="logo"
            height={TopbarHeight-20}
            width={50}
            priority
          />
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled href="/">
      {activeMode === "dark" ? (
        <Image
          src="/images/logos/dark-rtl-logo.svg"
          alt="logo"
          height={TopbarHeight}
          width={174}
          priority
        />
      ) : (
        <Image
          src="/images/logos/light-logo-rtl.svg"
          alt="logo"
          height={TopbarHeight}
          width={174}
          priority
        />
      )}
    </LinkStyled>
  );
};

export default Logo;
