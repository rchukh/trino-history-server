import {Link, LinkOptions, RegisteredRouter} from "@tanstack/react-router";
import {Button, ButtonProps} from "@mui/material";

// https://github.com/TanStack/router/discussions/721#discussioncomment-9138681
type ButtonLinkProps<TTo extends string = ''> = LinkOptions<RegisteredRouter['routeTree'], '/', TTo> & ButtonProps;

export function ButtonLink<TTo extends string = ''>(props: ButtonLinkProps<TTo>)
{
    return <Button component={Link} {...props} />;
}
